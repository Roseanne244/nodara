import { useMemo, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  CheckCircle,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileText,
  HardDrive,
  Hourglass,
  TrendingUp,
  Upload,
  Wallet,
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { PreviewModal } from '../components/PreviewModal'
import { useShelbyClient } from '../providers/ShelbyProvider'
import { useBlobs } from '../hooks/useBlobs'
import { SkeletonCard, SkeletonRow } from '../components/Skeleton'
import {
  fmtBytes,
  fmtDate,
  fmtExpiry,
  fmtExpiryRelative,
  fmtRelative,
  copyToClipboard,
  getExpiryState,
  getExplorerUrl,
  getPreviewKind,
  readShelbyBlob,
  readShelbyBlobToFile,
} from '../lib/utils'
import { NETWORKS } from '../lib/networks'

function buildWeekChart(blobs) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const now = new Date()
  return days.map((day, index) => {
    const target = new Date(now)
    target.setDate(now.getDate() - (6 - index))
    const dayBlobs = blobs.filter((blob) => new Date(blob.timestamp).toDateString() === target.toDateString())
    return {
      day,
      uploads: dayBlobs.length,
      mb: +(dayBlobs.reduce((acc, blob) => acc + (blob.size ?? 0), 0) / 1_048_576).toFixed(1),
    }
  })
}

const ttStyle = {
  background: 'var(--surf)',
  border: '1px solid var(--border2)',
  borderRadius: 10,
  fontSize: 13,
  color: 'var(--text)',
}

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

function OverviewInner({ networkKey, onToast }) {
  const [busyBlob, setBusyBlob] = useState(null)
  const [preview, setPreview] = useState({
    open: false,
    title: '',
    subtitle: '',
    kind: null,
    objectUrl: null,
    textContent: '',
  })
  const shelbyClient = useShelbyClient()
  const { blobs, stats, isLoading, isFetching, isError, error, refetch } = useBlobs()
  const chartData = useMemo(() => buildWeekChart(blobs), [blobs])
  const storageSummary = useMemo(() => {
    return blobs.reduce((acc, blob) => {
      const tone = getExpiryState(blob.expiresAt).tone
      if (tone === 'success') acc.active += 1
      else if (tone === 'warning') acc.expiring += 1
      else if (tone === 'danger') acc.expired += 1
      else acc.noExpiry += 1
      return acc
    }, { active: 0, expiring: 0, expired: 0, noExpiry: 0 })
  }, [blobs])

  const handleDownload = async (blob) => {
    if (!shelbyClient) return

    try {
      setBusyBlob(blob.id)
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

  const handleCopyReference = async (blob) => {
    const ok = await copyToClipboard(blob.fullName || blob.name)
    if (ok) onToast?.(`Copied reference for ${blob.name}`, 'success')
    else onToast?.('Failed to copy blob reference.', 'error')
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
      setBusyBlob(blob.id)
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {isLoading
          ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          : [
              {
                label: 'Total Uploads',
                value: stats.total,
                sub: `All time on ${NETWORKS[networkKey].short}`,
                icon: <Upload size={17} color="var(--acc)" />,
                color: 'var(--acc)',
              },
              {
                label: 'Total Stored',
                value: fmtBytes(stats.totalSize),
                sub: 'Across Shelby network',
                icon: <HardDrive size={17} color="var(--acc2)" />,
                color: 'var(--acc2)',
              },
              {
                label: 'Active Files',
                value: storageSummary.active,
                sub: storageSummary.expiring > 0 ? `${storageSummary.expiring} expiring soon` : 'Healthy retention window',
                icon: <CheckCircle size={17} color="var(--ok)" />,
                color: 'var(--ok)',
              },
              {
                label: 'Expiry Watch',
                value: storageSummary.expiring + storageSummary.expired,
                sub: `${storageSummary.expired} expired - ${storageSummary.noExpiry} with no expiry`,
                icon: <Hourglass size={17} color="var(--warn)" />,
                color: 'var(--warn)',
              },
            ].map((stat) => (
              <div key={stat.label} className="card card-lift" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span className="stat-label">{stat.label}</span>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-sub">{stat.sub}</div>
              </div>
            ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Upload Activity</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Last 7 days</div>
            </div>
            <div className="badge">
              <TrendingUp size={12} /> This week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6C5CE7" />
                  <stop offset="100%" stopColor="#00D1FF" />
                </linearGradient>
                <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={ttStyle} cursor={{ stroke: 'var(--border2)' }} />
              <Area
                type="monotone"
                dataKey="uploads"
                stroke="url(#gs)"
                fill="url(#gf)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6C5CE7', strokeWidth: 2, stroke: 'var(--surf)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Storage Volume</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>MB per day</div>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={chartData} barSize={14} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C5CE7" />
                  <stop offset="100%" stopColor="#00D1FF" />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <Tooltip contentStyle={ttStyle} cursor={{ fill: 'var(--surf2)' }} />
              <Bar dataKey="mb" fill="url(#bg)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Recent Uploads</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {isError
                ? 'Latest storage activity could not be loaded.'
                : isLoading
                  ? 'Loading latest files from Shelby.'
                  : `Showing the latest 5 files on ${NETWORKS[networkKey].short}.`}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFetching && !isLoading && (
              <span className="badge" style={{ color: 'var(--acc)', borderColor: 'rgba(108,92,231,.25)' }}>
                Syncing
              </span>
            )}
            <span className="badge">{blobs.length} files</span>
          </div>
        </div>
        {isError && (
          <div className="alert-banner alert-error fade-in" style={{ margin: 18, marginBottom: 0 }}>
            <FileText size={16} />
            <span style={{ flex: 1 }}>Failed to load recent uploads: {error?.message ?? 'Unknown error'}</span>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Size</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <SkeletonRow
                    key={i}
                    columns={6}
                    widths={['82%', '44%', '68%', '58%', '46%', '36%']}
                  />
                ))
              : blobs.slice(0, 5).map((blob) => {
                  const expiryState = getExpiryState(blob.expiresAt)
                  const expiryStyle = expiryToneStyles[expiryState.tone] ?? expiryToneStyles.neutral

                  return (
                    <tr key={blob.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 33,
                              height: 33,
                              borderRadius: 8,
                              background: 'var(--surf2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <FileText size={14} color="var(--muted)" />
                          </div>
                          <span
                            style={{
                              fontWeight: 500,
                              fontSize: 13.5,
                              maxWidth: 180,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
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
                          {blob.txHash && (
                            <a
                              href={getExplorerUrl(blob.txHash, networkKey)}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--acc)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                            >
                              <ExternalLink size={12} /> Tx
                            </a>
                          )}
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
                        </div>
                      </td>
                    </tr>
                  )
                })}
            {!isLoading && blobs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 36 }}>
                  No uploads yet. Head to Upload and store your first file on Shelby.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function Overview({ networkKey, onToast }) {
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
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 9 }}>Connect your wallet</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
          Connect an Aptos-compatible wallet to view your storage activity.
        </div>
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
      <OverviewInner networkKey={networkKey} onToast={onToast} />
    </div>
  )
}
