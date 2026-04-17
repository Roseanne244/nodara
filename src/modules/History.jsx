import { useEffect, useMemo, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useDeleteBlobs } from '@shelby-protocol/react'
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react'
import { useShelbyClient } from '../providers/ShelbyProvider'
import { ConfirmModal } from '../components/ConfirmModal'
import { PreviewModal } from '../components/PreviewModal'
import { useBlobs } from '../hooks/useBlobs'
import { SkeletonRow } from '../components/Skeleton'
import {
  copyToClipboard,
  fmtBytes,
  fmtDate,
  fmtExpiry,
  fmtExpiryRelative,
  fmtRelative,
  getBlobExplorerUrl,
  getExpiryState,
  getExplorerUrl,
  getPreviewKind,
  readShelbyBlob,
  readShelbyBlobToFile,
} from '../lib/utils'
import { NETWORKS } from '../lib/networks'

const expiryToneStyles = {
  danger: {
    color: '#ef4444',
    borderColor: 'rgba(239,68,68,.25)',
  },
  warning: {
    color: '#f59e0b',
    borderColor: 'rgba(245,158,11,.25)',
  },
  success: {
    color: 'var(--ok)',
    borderColor: 'rgba(0,200,83,.25)',
  },
  neutral: {
    color: 'var(--muted)',
    borderColor: 'var(--border)',
  },
}

function HistoryInner({ networkKey, onToast }) {
  const [page, setPage] = useState(0)
  const [busyBlob, setBusyBlob] = useState(null)
  const [search, setSearch] = useState('')
  const [expiryFilter, setExpiryFilter] = useState('all')
  const [sortKey, setSortKey] = useState('newest')
  const [selectedIds, setSelectedIds] = useState([])
  const [preview, setPreview] = useState({
    open: false,
    title: '',
    subtitle: '',
    kind: null,
    objectUrl: null,
    textContent: '',
  })
  const [deleteIntent, setDeleteIntent] = useState(null)
  const wallet = useWallet()
  const shelbyClient = useShelbyClient()
  const deleteBlobs = useDeleteBlobs({})
  const { blobs, stats, isLoading, isFetching, isError, error, refetch, hasMore } = useBlobs(page)

  const filteredBlobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    let next = blobs

    if (query) {
      next = next.filter((blob) =>
        blob.name.toLowerCase().includes(query) || blob.fullName.toLowerCase().includes(query)
      )
    }

    if (expiryFilter !== 'all') {
      next = next.filter((blob) => {
        const tone = getExpiryState(blob.expiresAt).tone

        if (expiryFilter === 'active') return tone === 'success'
        if (expiryFilter === 'expiring') return tone === 'warning'
        if (expiryFilter === 'expired') return tone === 'danger'
        if (expiryFilter === 'none') return tone === 'neutral'

        return true
      })
    }

    return [...next].sort((left, right) => {
      if (sortKey === 'newest') return right.timestamp.getTime() - left.timestamp.getTime()
      if (sortKey === 'oldest') return left.timestamp.getTime() - right.timestamp.getTime()
      if (sortKey === 'largest') return right.size - left.size
      if (sortKey === 'smallest') return left.size - right.size
      if (sortKey === 'name-asc') return left.name.localeCompare(right.name)
      if (sortKey === 'name-desc') return right.name.localeCompare(left.name)
      return 0
    })
  }, [blobs, expiryFilter, search, sortKey])

  useEffect(() => {
    const validIds = new Set(filteredBlobs.map((blob) => blob.id))
    setSelectedIds((current) => current.filter((id) => validIds.has(id)))
  }, [filteredBlobs])

  const selectedBlobs = useMemo(
    () => filteredBlobs.filter((blob) => selectedIds.includes(blob.id)),
    [filteredBlobs, selectedIds]
  )

  const isAllSelected = filteredBlobs.length > 0 && selectedIds.length === filteredBlobs.length
  const activeFilterCount =
    (search ? 1 : 0) +
    (expiryFilter !== 'all' ? 1 : 0) +
    (sortKey !== 'newest' ? 1 : 0)

  const toggleBlobSelection = (blobId) => {
    setSelectedIds((current) =>
      current.includes(blobId)
        ? current.filter((id) => id !== blobId)
        : [...current, blobId]
    )
  }

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredBlobs.map((blob) => blob.id))
  }

  const handleCopyReference = async (blob) => {
    const ok = await copyToClipboard(blob.fullName || blob.name)
    if (ok) onToast?.(`Copied reference for ${blob.name}`, 'success')
    else onToast?.('Failed to copy blob reference.', 'error')
  }

  const handleCopySelectedReferences = async () => {
    if (selectedBlobs.length === 0) return

    const payload = selectedBlobs.map((blob) => blob.fullName || blob.name).join('\n')
    const ok = await copyToClipboard(payload)

    if (ok) onToast?.(`Copied ${selectedBlobs.length} blob reference${selectedBlobs.length > 1 ? 's' : ''}`, 'success')
    else onToast?.('Failed to copy selected blob references.', 'error')
  }

  const handleDownload = async (blob) => {
    if (!shelbyClient) return

    try {
      setBusyBlob(`download:${blob.id}`)
      const response = await shelbyClient.download({
        account: blob.owner,
        blobName: blob.name,
      })
      await readShelbyBlobToFile(response, blob.name)
      onToast?.(`Downloaded ${blob.name}`, 'success')
    } catch (downloadError) {
      console.error('[Nodara] Failed to download blob:', downloadError)
      onToast?.(downloadError?.message ?? 'Failed to download file.', 'error')
    } finally {
      setBusyBlob(null)
    }
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

  const handlePreview = async (blob) => {
    if (!shelbyClient) return

    const kind = getPreviewKind(blob.name)
    if (!kind) {
      onToast?.('Preview is only available for image, text, and PDF files.', 'info')
      return
    }

    try {
      setBusyBlob(`preview:${blob.id}`)
      const response = await shelbyClient.download({
        account: blob.owner,
        blobName: blob.name,
      })
      const mimeType =
        kind === 'pdf'
          ? 'application/pdf'
          : kind === 'image'
            ? 'image/*'
            : 'text/plain'
      const fileBlob = await readShelbyBlob(response, mimeType)
      const objectUrl = kind === 'text' ? null : URL.createObjectURL(fileBlob)
      const textContent = kind === 'text' ? await fileBlob.text() : ''

      setPreview({
        open: true,
        title: blob.name,
        subtitle: `${blob.sizeLabel} - ${NETWORKS[networkKey].short}`,
        kind,
        objectUrl,
        textContent,
      })
    } catch (previewError) {
      console.error('[Nodara] Failed to preview blob:', previewError)
      onToast?.(previewError?.message ?? 'Failed to preview file.', 'error')
    } finally {
      setBusyBlob(null)
    }
  }

  const closeDeleteModal = () => {
    if (deleteBlobs.isPending) return
    setDeleteIntent(null)
  }

  const handleDeleteMany = async (targetBlobs) => {
    if (!wallet.connected || targetBlobs.length === 0) return

    const names = targetBlobs.map((blob) => blob.name)

    try {
      setBusyBlob(`delete:${names.join(',')}`)
      await deleteBlobs.mutateAsync({
        signer: wallet,
        blobNames: names,
      })
      await refetch()
      setSelectedIds((current) => current.filter((id) => !targetBlobs.some((blob) => blob.id === id)))
      onToast?.(
        targetBlobs.length === 1
          ? `${targetBlobs[0].name} deleted from ${NETWORKS[networkKey].short}`
          : `${targetBlobs.length} files deleted from ${NETWORKS[networkKey].short}`,
        'success'
      )
      setDeleteIntent(null)
    } catch (deleteError) {
      console.error('[Nodara] Failed to delete blob(s):', deleteError)
      onToast?.(deleteError?.message ?? 'Failed to delete file.', 'error')
    } finally {
      setBusyBlob(null)
    }
  }

  const handleDelete = async (blob) => {
    setDeleteIntent({
      blobs: [blob],
      title: `Delete "${blob.name}"?`,
      description: `This will remove the file from ${NETWORKS[networkKey].label} for the connected wallet. This action cannot be undone.`,
      confirmLabel: 'Delete file',
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedBlobs.length === 0) return

    setDeleteIntent({
      blobs: selectedBlobs,
      title: `Delete ${selectedBlobs.length} selected file${selectedBlobs.length > 1 ? 's' : ''}?`,
      description: `This will remove ${selectedBlobs.length} file${selectedBlobs.length > 1 ? 's' : ''} from ${NETWORKS[networkKey].label}. This action cannot be undone.`,
      confirmLabel: `Delete ${selectedBlobs.length} file${selectedBlobs.length > 1 ? 's' : ''}`,
    })
  }

  if (isError) {
    return (
      <div className="alert-banner alert-error fade-in">
        <AlertCircle size={16} />
        <span>Failed to load history: {error?.message ?? 'Unknown error'}</span>
        <button
          className="btn btn-ghost"
          style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 13 }}
          onClick={() => refetch()}
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <ConfirmModal
        open={Boolean(deleteIntent)}
        title={deleteIntent?.title}
        description={deleteIntent?.description}
        confirmLabel={deleteIntent?.confirmLabel}
        busy={deleteBlobs.isPending}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteMany(deleteIntent?.blobs ?? [])}
      />

      <PreviewModal
        open={preview.open}
        title={preview.title}
        subtitle={preview.subtitle}
        kind={preview.kind}
        objectUrl={preview.objectUrl}
        textContent={preview.textContent}
        onClose={closePreview}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 4 }}>Upload History</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            {isLoading
              ? 'Loading...'
              : `${stats.total} file${stats.total !== 1 ? 's' : ''} - ${fmtBytes(stats.totalSize)} on ${NETWORKS[networkKey].label}`}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => refetch()} disabled={isFetching} style={{ gap: 7 }}>
          <RefreshCw size={13} className={isFetching ? 'spin' : ''} /> Refresh
        </button>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,2fr) minmax(160px,1fr) minmax(160px,1fr)', gap: 12 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surf2)',
            }}
          >
            <Search size={15} color="var(--muted)" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search file name on this page"
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
            />
            {search && (
              <button
                className="btn btn-ghost"
                style={{ padding: 6 }}
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surf2)',
            }}
          >
            <AlertCircle size={15} color="var(--muted)" />
            <select
              value={expiryFilter}
              onChange={(event) => setExpiryFilter(event.target.value)}
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
              <option value="all">All expiry states</option>
              <option value="active">Active only</option>
              <option value="expiring">Expiring soon</option>
              <option value="expired">Expired</option>
              <option value="none">No expiry</option>
            </select>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surf2)',
            }}
          >
            <ArrowUpDown size={15} color="var(--muted)" />
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
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
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="largest">Largest first</option>
              <option value="smallest">Smallest first</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge">{filteredBlobs.length} visible</span>
            <span className="badge" style={{ color: 'var(--muted)' }}>
              Page {page + 1}
            </span>
            {selectedIds.length > 0 && (
              <span className="badge" style={{ color: 'var(--acc)', borderColor: 'rgba(108,92,231,.25)' }}>
                {selectedIds.length} selected
              </span>
            )}
            {activeFilterCount > 0 && (
              <span className="badge" style={{ color: 'var(--acc)', borderColor: 'rgba(108,92,231,.25)' }}>
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {selectedIds.length > 0 && (
              <>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '8px 12px' }}
                  onClick={handleCopySelectedReferences}
                  disabled={busyBlob !== null}
                >
                  <Copy size={14} /> Copy selected
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '8px 12px', color: '#ef4444' }}
                  onClick={handleDeleteSelected}
                  disabled={busyBlob !== null || deleteBlobs.isPending}
                >
                  <Trash2 size={14} /> Delete selected
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '8px 12px' }}
                  onClick={() => setSelectedIds([])}
                >
                  <X size={14} /> Clear selected
                </button>
              </>
            )}

            {activeFilterCount > 0 && (
              <button
                className="btn btn-ghost"
                style={{ padding: '8px 12px' }}
                onClick={() => {
                  setSearch('')
                  setExpiryFilter('all')
                  setSortKey('newest')
                }}
              >
                <X size={14} /> Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 46 }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  disabled={isLoading || filteredBlobs.length === 0}
                  title="Select all files on this page"
                />
              </th>
              <th>File</th>
              <th>Size</th>
              <th>Expires</th>
              <th>Transaction</th>
              <th>Network</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [1, 2, 3, 4, 5].map((index) => (
                  <SkeletonRow
                    key={index}
                    columns={9}
                    widths={['24%', '82%', '42%', '68%', '54%', '48%', '60%', '46%', '34%']}
                  />
                ))
              : filteredBlobs.map((blob) => {
                  const expiryState = getExpiryState(blob.expiresAt)
                  const expiryStyle = expiryToneStyles[expiryState.tone] ?? expiryToneStyles.neutral
                  const isSelected = selectedIds.includes(blob.id)
                  const blobExplorerUrl = getBlobExplorerUrl({
                    owner: blob.owner,
                    blobName: blob.name,
                    networkKey,
                  })

                  return (
                    <tr key={blob.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBlobSelection(blob.id)}
                          title={`Select ${blob.name}`}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: 'var(--surf2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <FileText size={15} color="var(--muted)" />
                          </div>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 13.5,
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={blob.name}
                          >
                            {blob.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--muted)', fontSize: 13 }}>{blob.sizeLabel}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span className="badge" style={{ ...expiryStyle, width: 'fit-content' }}>
                            {expiryState.label}
                          </span>
                          <span style={{ color: 'var(--muted)', fontSize: 12 }} title={fmtExpiry(blob.expiresAt)}>
                            {fmtExpiry(blob.expiresAt)}
                          </span>
                          <span style={{ color: 'var(--subtle)', fontSize: 11.5 }}>
                            {fmtExpiryRelative(blob.expiresAt)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {blob.txHash ? (
                            <>
                              <code style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                                {blob.txHash.slice(0, 10)}...{blob.txHash.slice(-6)}
                              </code>
                              <a
                                href={getExplorerUrl(blob.txHash, networkKey)}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--acc)', display: 'flex' }}
                              >
                                <ExternalLink size={12} />
                              </a>
                            </>
                          ) : blobExplorerUrl ? (
                            <a
                              href={blobExplorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--acc)', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600 }}
                              title="Open blob details in Shelby Explorer"
                            >
                              Blob Explorer <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ color: 'var(--subtle)', fontSize: 12 }}>-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            borderColor: networkKey === 'devnet' ? 'rgba(245,158,11,.25)' : 'rgba(16,185,129,.25)',
                          }}
                        >
                          <span className="dot" style={{ background: NETWORKS[networkKey].color, width: 6, height: 6 }} />
                          {NETWORKS[networkKey].short}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ color: 'var(--ok)', borderColor: 'rgba(0,200,83,.25)' }}>
                          <CheckCircle size={11} /> Confirmed
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--muted)', fontSize: 13 }} title={fmtDate(blob.timestamp)}>
                          {fmtRelative(blob.timestamp)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '8px 10px' }}
                            onClick={() => handlePreview(blob)}
                            disabled={busyBlob !== null}
                            title="Preview file"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '8px 10px' }}
                            onClick={() => handleCopyReference(blob)}
                            disabled={busyBlob !== null}
                            title="Copy blob reference"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '8px 10px' }}
                            onClick={() => handleDownload(blob)}
                            disabled={busyBlob !== null}
                            title="Download file"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '8px 10px', color: '#ef4444' }}
                            onClick={() => handleDelete(blob)}
                            disabled={busyBlob !== null || deleteBlobs.isPending}
                            title="Delete file"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            {!isLoading && filteredBlobs.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: 48 }}>
                  <FileText size={28} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                  {blobs.length === 0
                    ? `No uploads on ${NETWORKS[networkKey].label} yet. Upload your first file to start building a storage history.`
                    : 'No files match your search or filter on this page. Try resetting the controls above.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {(page > 0 || hasMore) && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: 13 }}
              disabled={page === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              Page {page + 1} {activeFilterCount > 0 ? '- filters apply to current page' : ''}
            </span>
            <button
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: 13 }}
              disabled={!hasMore}
              onClick={() => setPage((value) => value + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export function History({ networkKey, onToast }) {
  const { connected } = useWallet()
  const shelbyClient = useShelbyClient()

  if (!connected) {
    return (
      <div className="card fade-in" style={{ padding: 52, textAlign: 'center' }}>
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
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 9 }}>Connect wallet to view history</div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Your upload history is tied to your wallet address.</div>
      </div>
    )
  }

  if (!shelbyClient) {
    return (
      <div className="alert-banner alert-warning fade-in">
        Shelby SDK not initialized - check <code>src/lib/shelby.js</code> import path and restart.
      </div>
    )
  }

  return (
    <div className="fade-in">
      <HistoryInner networkKey={networkKey} onToast={onToast} />
    </div>
  )
}
