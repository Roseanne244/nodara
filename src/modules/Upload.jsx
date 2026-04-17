import { useCallback, useMemo, useRef, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  Check,
  Copy,
  Eye,
  ExternalLink,
  FileText,
  HardDrive,
  Loader2,
  Plus,
  ShieldCheck,
  Upload as UploadIcon,
  Wallet,
  X,
} from 'lucide-react'
import { PreviewModal } from '../components/PreviewModal'
import { useShelbyClient } from '../providers/ShelbyProvider'
import { useUpload, UPLOAD_STEPS } from '../hooks/useUpload'
import { copyToClipboard, fmtBytes, fmtDate, getExplorerUrl, getPreviewKind } from '../lib/utils'
import { NETWORKS } from '../lib/networks'

const STEP_KEYS = UPLOAD_STEPS.filter((step) =>
  ['preparing', 'signing', 'uploading', 'confirming'].includes(step.key)
)

const EXPIRY_PRESETS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 360, label: '360 days' },
]

const statusCopy = {
  preparing: 'Preparing the payload and reading your file for Shelby.',
  signing: 'Approve the transaction in your wallet to register the blob.',
  uploading: 'Your file is being pushed to Shelby storage nodes.',
  confirming: 'Waiting for the Aptos transaction state to settle.',
  done: 'Upload completed. Your file is now available in history.',
}

function createQueueItems(fileList) {
  return Array.from(fileList).map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    status: 'queued',
    error: null,
    blobName: null,
  }))
}

function UploadInner({ networkKey, onSuccess, onToast }) {
  const { upload, reset, step, progress, txHash, error, isInProgress, isDone } = useUpload()
  const [queue, setQueue] = useState([])
  const [drag, setDrag] = useState(false)
  const [activeUploadId, setActiveUploadId] = useState(null)
  const [expiryDays, setExpiryDays] = useState(30)
  const [preview, setPreview] = useState({
    open: false,
    title: '',
    subtitle: '',
    kind: null,
    objectUrl: null,
    textContent: '',
  })
  const fileRef = useRef()
  const network = NETWORKS[networkKey]
  const expiryPreview = useMemo(
    () => new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
    [expiryDays]
  )

  const queueStats = useMemo(() => {
    return queue.reduce((acc, item) => {
      acc.total += 1
      acc.bytes += item.file.size
      if (item.status === 'success') acc.success += 1
      else if (item.status === 'error') acc.failed += 1
      else if (item.status === 'uploading') acc.uploading += 1
      else acc.queued += 1
      return acc
    }, { total: 0, bytes: 0, success: 0, failed: 0, uploading: 0, queued: 0 })
  }, [queue])

  const activeItem = useMemo(
    () => queue.find((item) => item.id === activeUploadId) ?? null,
    [activeUploadId, queue]
  )

  const updateQueueItem = useCallback((id, patch) => {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }, [])

  const appendFiles = useCallback((fileList) => {
    const nextItems = createQueueItems(fileList)
    if (nextItems.length === 0) return

    setQueue((current) => {
      const existingIds = new Set(current.map((item) => item.id))
      const uniqueItems = nextItems.filter((item) => !existingIds.has(item.id))
      return [...current, ...uniqueItems]
    })
    reset()
  }, [reset])

  const handleDrop = (event) => {
    event.preventDefault()
    setDrag(false)
    appendFiles(event.dataTransfer.files)
  }

  const handleRemoveItem = (id) => {
    setQueue((current) => current.filter((item) => item.id !== id))
  }

  const handleRetryFailed = () => {
    setQueue((current) =>
      current.map((item) =>
        item.status === 'error'
          ? { ...item, status: 'queued', error: null }
          : item
      )
    )
    reset()
  }

  const handleRemoveFailed = () => {
    setQueue((current) => current.filter((item) => item.status !== 'error'))
  }

  const handleReset = () => {
    setQueue([])
    setActiveUploadId(null)
    reset()
  }

  const closePreview = () => {
    if (preview.objectUrl) URL.revokeObjectURL(preview.objectUrl)
    setPreview({
      open: false,
      title: '',
      subtitle: '',
      kind: null,
      objectUrl: null,
      textContent: '',
    })
  }

  const openFilePreview = async (file) => {
    const kind = getPreviewKind(file.name, file.type)
    if (!kind) {
      onToast?.('Preview is only available for image, text, and PDF files.', 'info')
      return
    }

    let objectUrl = null
    let textContent = ''

    if (kind === 'image' || kind === 'pdf') {
      objectUrl = URL.createObjectURL(file)
    } else if (kind === 'text') {
      textContent = await file.text()
    }

    setPreview({
      open: true,
      title: file.name,
      subtitle: `${fmtBytes(file.size)} - local file preview`,
      kind,
      objectUrl,
      textContent,
    })
  }

  const handleCopyBlobName = async (item) => {
    if (!item.blobName) return
    const ok = await copyToClipboard(item.blobName)
    if (ok) onToast?.(`Copied blob name for ${item.file.name}`, 'success')
    else onToast?.('Failed to copy blob name.', 'error')
  }

  const handleUploadAll = async () => {
    const targets = queue.filter((item) => item.status === 'queued' || item.status === 'error')
    if (targets.length === 0) return

    let successCount = 0
    const successfulFiles = []

    for (const item of targets) {
      setActiveUploadId(item.id)
      updateQueueItem(item.id, { status: 'uploading', error: null })

      try {
        const result = await upload(item.file, { expirationDays: expiryDays })
        updateQueueItem(item.id, {
          status: 'success',
          error: null,
          blobName: result?.blobName ?? null,
        })
        successCount += 1
        successfulFiles.push(item.file)
      } catch (uploadError) {
        updateQueueItem(item.id, {
          status: 'error',
          error: uploadError?.message ?? 'Upload failed.',
        })
      }
    }

    setActiveUploadId(null)

    if (successCount > 0) {
      onSuccess?.({
        count: successCount,
        files: successfulFiles,
        file: successfulFiles[0] ?? targets[0]?.file ?? null,
        txHash: null,
      })
    }

    const failedCount = targets.length - successCount

    if (successCount > 0 && failedCount === 0) {
      onToast?.(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''} to ${network.short}`, 'success')
    } else if (successCount > 0 && failedCount > 0) {
      onToast?.(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''}, ${failedCount} failed.`, 'info')
    } else if (failedCount > 0) {
      onToast?.(`All ${failedCount} upload${failedCount > 1 ? 's' : ''} failed.`, 'error')
    }
  }

  const activeIdx = STEP_KEYS.findIndex((entry) => entry.key === step)

  return (
    <>
      <PreviewModal
        open={preview.open}
        title={preview.title}
        subtitle={preview.subtitle}
        kind={preview.kind}
        objectUrl={preview.objectUrl}
        textContent={preview.textContent}
        onClose={closePreview}
      />

      {!isDone && (
        <div
          className={`drop-zone${drag ? ' drag' : ''}`}
          style={{ marginBottom: 16, cursor: isInProgress ? 'default' : 'pointer' }}
          onClick={() => !isInProgress && fileRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            if (!isInProgress) setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={(event) => appendFiles(event.target.files)}
          />

          {queueStats.total > 0 ? (
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg,rgba(108,92,231,.18),rgba(0,209,255,.14))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <FileText size={28} color="var(--acc)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>
                {queueStats.total} file{queueStats.total > 1 ? 's' : ''} ready
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>{fmtBytes(queueStats.bytes)} in queue</div>
              {!isInProgress && (
                <button
                  className="btn btn-ghost"
                  style={{ marginTop: 12, fontSize: 13, padding: '6px 12px' }}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleReset()
                  }}
                >
                  <X size={13} /> Clear queue
                </button>
              )}
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'var(--surf2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <UploadIcon size={28} color="var(--muted)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Drop files here or click to browse</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>Multi-file queue enabled - image, text, and PDF preview supported.</div>
            </div>
          )}
        </div>
      )}

      <div
        className="card"
        style={{
          marginBottom: 16,
          padding: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {[
          {
            label: 'Target Network',
            value: network.label,
            sub: 'Wallet and Shelby client are aligned',
            icon: <ShieldCheck size={16} color={network.color} />,
          },
          {
            label: 'Expiry Window',
            value: fmtDate(expiryPreview),
            sub: `${expiryDays} days from upload confirmation`,
            icon: <CalendarClock size={16} color="var(--warn)" />,
          },
          {
            label: 'Queue Size',
            value: queueStats.total ? `${queueStats.total} file${queueStats.total > 1 ? 's' : ''}` : 'No files yet',
            sub: queueStats.total ? fmtBytes(queueStats.bytes) : 'Choose files to prepare upload',
            icon: <HardDrive size={16} color="var(--acc2)" />,
          },
          {
            label: 'Queue Status',
            value: queueStats.uploading > 0 ? 'Uploading' : queueStats.failed > 0 ? 'Needs review' : 'Ready',
            sub: `${queueStats.success} success - ${queueStats.failed} failed`,
            icon: <Check size={16} color="var(--ok)" />,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: 14,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--surf2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {item.icon}
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {item.label}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 5 }}>
              {item.value}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Expiry Preset</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              Apply one retention window to all files in the current upload queue.
            </div>
          </div>

          <label
            style={{
              minWidth: 220,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surf2)',
            }}
          >
            <CalendarClock size={15} color="var(--muted)" />
            <select
              value={expiryDays}
              onChange={(event) => setExpiryDays(Number(event.target.value))}
              disabled={isInProgress}
              style={{
                flex: 1,
                height: 42,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: 13.5,
                fontFamily: 'inherit',
              }}
            >
              {EXPIRY_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Upload Queue</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                Review files, preview lightweight types, and upload the queue sequentially.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge">{queueStats.total} queued</span>
              {queueStats.failed > 0 && (
                <span className="badge" style={{ color: 'var(--warn)', borderColor: 'rgba(245,158,11,.25)' }}>
                  {queueStats.failed} failed
                </span>
              )}
              {queueStats.failed > 0 && !isInProgress && (
                <>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '8px 12px' }}
                    onClick={handleRetryFailed}
                  >
                    Retry failed
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '8px 12px', color: '#ef4444' }}
                    onClick={handleRemoveFailed}
                  >
                    Remove failed
                  </button>
                </>
              )}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Size</th>
                <th>Preview</th>
                <th>Status</th>
                <th>Blob Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => {
                const previewKind = getPreviewKind(item.file.name, item.file.type)
                const isActive = item.id === activeUploadId

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: 'var(--surf2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={14} color="var(--muted)" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 240,
                            }}
                            title={item.file.name}
                          >
                            {item.file.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                            {item.file.type || 'binary/octet-stream'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>{fmtBytes(item.file.size)}</span>
                    </td>
                    <td>
                      {previewKind ? (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '8px 10px' }}
                          onClick={() => openFilePreview(item.file)}
                        >
                          <Eye size={14} /> Preview
                        </button>
                      ) : (
                        <span style={{ color: 'var(--subtle)', fontSize: 12 }}>Not available</span>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          color:
                            item.status === 'success'
                              ? 'var(--ok)'
                              : item.status === 'error'
                                ? '#ef4444'
                                : item.status === 'uploading'
                                  ? 'var(--acc)'
                                  : 'var(--muted)',
                          borderColor:
                            item.status === 'success'
                              ? 'rgba(0,200,83,.25)'
                              : item.status === 'error'
                                ? 'rgba(239,68,68,.25)'
                                : item.status === 'uploading'
                                  ? 'rgba(108,92,231,.25)'
                                  : 'var(--border)',
                        }}
                      >
                        {item.status === 'success'
                          ? 'Uploaded'
                          : item.status === 'error'
                            ? 'Failed'
                            : isActive
                              ? UPLOAD_STEPS.find((entry) => entry.key === step)?.label || 'Uploading'
                              : 'Queued'}
                      </span>
                      {item.error && (
                        <div style={{ marginTop: 6, fontSize: 11.5, color: '#ef4444', maxWidth: 220 }}>
                          {item.error}
                        </div>
                      )}
                    </td>
                    <td>
                      {item.blobName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <code style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                            {item.blobName.slice(0, 18)}...
                          </code>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '6px 8px' }}
                            onClick={() => handleCopyBlobName(item)}
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--subtle)', fontSize: 12 }}>Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '8px 10px', color: '#ef4444' }}
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isInProgress}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {step === 'error' && error && (
        error === 'NEED_API_KEY' ? (
          <div
            className="card fade-up"
            style={{
              marginBottom: 16,
              padding: 20,
              borderColor: 'rgba(255,82,82,.25)',
              background: 'rgba(255,82,82,.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--err)', fontWeight: 700, marginBottom: 10 }}>
              <AlertCircle size={16} /> Shelby API key required
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.65, marginBottom: 12 }}>
              This upload path needs an API key for <strong>{network.label}</strong>. Your wallet setup is fine, but the Shelby indexer is rejecting the request.
            </p>
            <ol style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 18, marginBottom: 14 }}>
              <li>Open <code style={{ color: 'var(--text)' }}>.env.local</code> in the project root</li>
              <li>
                Fill <code style={{ color: 'var(--acc)' }}>{networkKey === 'devnet' ? 'VITE_SHELBY_API_KEY_SHELBYNET' : 'VITE_SHELBY_API_KEY_TESTNET'}</code>
              </li>
              <li>Restart the dev server</li>
              <li>Retry the upload after the network client reloads</li>
            </ol>
            <div style={{ fontSize: 12, color: 'var(--subtle)', padding: '8px 12px', borderRadius: 8, background: 'var(--surf2)' }}>
              The legacy <code>VITE_SHELBY_API_KEY</code> fallback still works, but per-network keys are safer.
            </div>
          </div>
        ) : (
          <div className="alert-banner alert-error fade-up" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} />
            <span style={{ flex: 1 }}>{error}</span>
          </div>
        )
      )}

      {(step !== 'idle' && activeItem) && (
        <div className="card fade-up" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Current Upload</div>
            <span className="badge" style={{ color: 'var(--acc)', borderColor: 'rgba(108,92,231,.25)' }}>
              {UPLOAD_STEPS.find((entry) => entry.key === step)?.label || 'In progress'}
            </span>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6, fontWeight: 600 }}>
            {activeItem.file.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
            {statusCopy[step] ?? 'Processing your upload request.'}
          </div>

          {step === 'signing' && (
            <div className="alert-banner alert-info" style={{ marginBottom: 16 }}>
              <AlertCircle size={15} /> Check your wallet and approve the Aptos transaction.
            </div>
          )}

          {step === 'uploading' && (
            <div style={{ marginBottom: 22 }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Uploading chunks to Shelby</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: "'JetBrains Mono',monospace" }}>{progress}%</span>
              </div>
            </div>
          )}

          {step === 'confirming' && (
            <div style={{ marginBottom: 22 }}>
              <div className="progress-track">
                <div className="progress-fill indeterminate" />
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>Waiting for Aptos confirmation</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STEP_KEYS.map((entry, index) => {
              const done = index < activeIdx
              const active = entry.key === step

              return (
                <div key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: done ? 'var(--ok)' : active ? 'var(--acc)' : 'var(--surf2)',
                    }}
                  >
                    {done ? (
                      <Check size={13} color="#fff" />
                    ) : active ? (
                      <Loader2 size={13} color="#fff" className="spin" />
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{index + 1}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: done || active ? 'var(--text)' : 'var(--muted)' }}>
                    {entry.label}
                  </span>
                  {done && <span style={{ fontSize: 12, color: 'var(--ok)', marginLeft: 'auto', fontWeight: 600 }}>Done</span>}
                </div>
              )
            })}
          </div>

          {isDone && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: 'rgba(0,200,83,.07)',
                border: '1px solid rgba(0,200,83,.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ok)', fontWeight: 700, marginBottom: 10 }}>
                <Check size={16} /> Upload confirmed on Aptos
              </div>
              {txHash ? (
                <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Tx:</span>
                  <code style={{ color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {txHash.slice(0, 26)}...
                  </code>
                  <a
                    href={getExplorerUrl(txHash, networkKey)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--acc)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}
                  >
                    <ExternalLink size={12} /> Explorer
                  </a>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  The current file was stored successfully. Remaining files will continue if they are still queued.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleUploadAll}
        disabled={queue.length === 0 || isInProgress}
        style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12, justifyContent: 'center' }}
      >
        <UploadIcon size={16} /> Upload queue to Shelby
      </button>

      {(queue.length > 0 || step === 'error') && (
        <button
          className="btn btn-outline"
          onClick={handleReset}
          disabled={isInProgress}
          style={{ width: '100%', padding: 14, fontSize: 15, borderRadius: 12, justifyContent: 'center', marginTop: 12 }}
        >
          <Plus size={16} /> Reset Queue
        </button>
      )}
    </>
  )
}

export function UploadModule({ networkKey, onSuccess, onToast }) {
  const { connected } = useWallet()
  const shelbyClient = useShelbyClient()

  if (!connected) {
    return (
      <div className="card fade-in" style={{ padding: 52, textAlign: 'center', maxWidth: 580, margin: '0 auto' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'var(--surf2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Wallet size={28} color="var(--muted)" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 9 }}>Wallet not connected</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.65 }}>
          Connect an Aptos wallet to sign upload transactions.
        </div>
      </div>
    )
  }

  if (!shelbyClient) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="alert-banner alert-warning fade-in" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} />
            <strong>Shelby SDK not initialized</strong>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6 }}>
            The <code>ShelbyClient</code> could not be created. Check <code>src/lib/shelby.js</code>, confirm the network API key is present, then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6 }}>Upload Files</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Files are stored on <strong style={{ color: 'var(--text)' }}>{NETWORKS[networkKey].label}</strong> via Shelby Protocol.
        </p>
      </div>
      <UploadInner networkKey={networkKey} onSuccess={onSuccess} onToast={onToast} />
    </div>
  )
}
