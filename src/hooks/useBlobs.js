import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useAccountBlobs } from '@shelby-protocol/react'
import { useMemo } from 'react'
import { fmtBytes } from '../lib/utils'

const PAGE_SIZE = 20

/**
 * SAFE: Only call this inside components gated by ShelbyClientProvider.
 *
 * Fixes applied vs original:
 *  - useAccountBlobs takes ONE merged object (params + query options), not two args
 *  - BlobMetadata fields: no blobId/id/createdAt/transactionHash
 *    → id:        b.name  (BlobName is unique per account)
 *    → name:      b.blobNameSuffix (human-readable suffix)
 *    → timestamp: b.creationMicros / 1000 (microseconds → ms → Date)
 *    → txHash:    null (not available in BlobMetadata; only in BlobActivity)
 *  - data is BlobMetadata[] directly, no wrapping needed
 */
export function useBlobs(page = 0) {
  const { account, connected } = useWallet()

  const { data, isLoading, isError, error, refetch, isFetching } = useAccountBlobs({
    account:              account?.address?.toString() ?? '',
    pagination:           { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    // React Query options merged into the same object
    enabled:              !!(connected && account?.address),
    staleTime:            30_000,
    refetchOnWindowFocus: false,
    // Do not retry on 401 — it means the indexer needs an API key
    retry: (failCount, err) => {
      const status = err?.response?.status ?? err?.status
      if (status === 401 || status === 403) return false
      return failCount < 2
    },
  })

  // data is BlobMetadata[] directly from the SDK
  const rawBlobs = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return []
  }, [data])

  const blobs = useMemo(() =>
    rawBlobs.map((b, i) => ({
      // BlobName (e.g. "@0x123/file-name.txt") is unique per account
      id:        b?.name ?? String(i),
      fullName:  b?.name ?? '',
      owner:     b?.owner ?? account?.address?.toString() ?? '',
      // blobNameSuffix is the human-readable part after the account prefix
      name:      b?.blobNameSuffix ?? b?.name ?? 'unnamed',
      size:      b?.size ?? 0,
      sizeLabel: fmtBytes(b?.size ?? 0),
      // creationMicros is in microseconds — convert to milliseconds for Date
      timestamp: b?.creationMicros
                 ? new Date(b.creationMicros / 1000)
                 : new Date(),
      expiresAt: b?.expirationMicros
                 ? new Date(b.expirationMicros / 1000)
                 : null,
      // transactionHash is not part of BlobMetadata (only BlobActivity has it)
      txHash:    null,
      status:    'confirmed',
    }))
  , [account?.address, rawBlobs])

  const stats = useMemo(() => ({
    total:     rawBlobs.length,
    totalSize: blobs.reduce((acc, b) => acc + (b.size ?? 0), 0),
  }), [blobs, rawBlobs.length])

  return {
    blobs, stats,
    isLoading:  isLoading  ?? false,
    isFetching: isFetching ?? false,
    isError:    isError    ?? false,
    error:      error      ?? null,
    refetch:    refetch    ?? (() => {}),
    // If we received a full page, there may be more
    hasMore:    rawBlobs.length === PAGE_SIZE,
  }
}
