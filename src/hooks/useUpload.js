import { useState, useCallback, useRef } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useUploadBlobs } from '@shelby-protocol/react'
import { uniqueBlobName, delay } from '../lib/utils'

export const UPLOAD_STEPS = [
  { key: 'idle',       label: '' },
  { key: 'preparing',  label: 'Preparing upload' },
  { key: 'signing',    label: 'Waiting for wallet signature' },
  { key: 'uploading',  label: 'Uploading to Shelby network' },
  { key: 'confirming', label: 'Confirming on Aptos' },
  { key: 'done',       label: 'Upload confirmed!' },
  { key: 'error',      label: 'Upload failed' },
]

const DAY_IN_MICROS = 24 * 60 * 60 * 1_000_000

// Expiration: N days from now in microseconds
const expirationMicrosFromDays = (days = 30) => Date.now() * 1000 + days * DAY_IN_MICROS

/**
 * SAFE: This hook must ONLY be used inside <UploadInner>
 * which is only rendered when ShelbyClientProvider is confirmed active.
 *
 * Fixes applied vs original:
 *  - signer: full wallet context (account + signAndSubmitTransaction), not just the fn
 *  - blobs[].blobName instead of name, blobs[].blobData (Uint8Array) instead of data (ArrayBuffer)
 *  - expirationMicros is required — added
 *  - onProgress is not a param of useUploadBlobs — removed
 *  - useUploadBlobs returns void — txHash is not extractable from result
 */
export function useUpload() {
  const wallet       = useWallet()           // full context needed as WalletAdapterSigner
  const walletRef    = useRef(wallet)
  walletRef.current  = wallet                // always fresh inside callback

  const [step,     setStep]     = useState('idle')
  const [progress, setProgress] = useState(0)
  const [txHash,   setTxHash]   = useState(null)
  const [error,    setError]    = useState(null)

  // Must pass {} — calling with no args destructures undefined and crashes
  const uploadMutation = useUploadBlobs({})
  const isPending = uploadMutation?.isPending ?? false

  const upload = useCallback(async (file, options = {}) => {
    const w = walletRef.current

    if (!w.connected) {
      setError('Wallet not connected.')
      setStep('error')
      return
    }

    setStep('preparing')
    setProgress(0)
    setError(null)
    setTxHash(null)

    const expirationMicros =
      options.expirationMicros ??
      expirationMicrosFromDays(options.expirationDays ?? 30)

    try {
      // SDK requires Uint8Array, not ArrayBuffer
      const blobData   = new Uint8Array(await file.arrayBuffer())
      const blobName   = uniqueBlobName(file)

      setStep('signing')

      // useUploadBlobs returns Promise<void> — no txHash in result
      // signer must be the full wallet context: { account, signAndSubmitTransaction }
      await uploadMutation.mutateAsync({
        blobs:            [{ blobName, blobData }],
        signer:           w,
        expirationMicros,
      })

      // Advance through remaining visual steps after async completes
      setStep('uploading')
      setProgress(100)
      await delay(350)
      setStep('confirming')
      await delay(650)
      setTxHash(null)   // unavailable from useUploadBlobs
      setStep('done')

      return { txHash: null, blobName }

    } catch (err) {
      setStep('error')
      const msg = parseShelbyError(err)
      setError(msg)
      throw new Error(msg)
    }
  }, [uploadMutation])

  const reset = useCallback(() => {
    setStep('idle')
    setProgress(0)
    setTxHash(null)
    setError(null)
  }, [])

  return {
    upload, reset,
    step, progress, txHash, error, isPending,
    isIdle:       step === 'idle',
    isDone:       step === 'done',
    isError:      step === 'error',
    isInProgress: ['preparing','signing','uploading','confirming'].includes(step),
  }
}

function parseShelbyError(err) {
  const msg = err?.message ?? String(err)
  if (msg.includes('rejected') || msg.includes('cancelled') || msg.includes('denied'))
    return 'Transaction was rejected in your wallet.'
  if (msg.includes('401') || msg.includes('Unauthorized'))
    return 'NEED_API_KEY'
  if (msg.includes('insufficient') || msg.includes('balance'))
    return 'Insufficient funds. Fund your wallet from the faucet.'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout'))
    return 'Network error. Check your connection and try again.'
  return `Upload failed: ${msg.slice(0, 150)}`
}
