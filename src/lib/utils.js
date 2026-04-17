/**
 * Shared utility helpers for Nodara
 */

/** Shorten a hex address: 0x1234...abcd */
export const fmtAddress = (addr) => {
  if (!addr) return ''
  const s = addr.toString()
  return `${s.slice(0, 6)}...${s.slice(-4)}`
}

/** Human-readable file size */
export const fmtBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

/** Format date to "Mar 30, 14:25" */
export const fmtDate = (d) =>
  new Intl.DateTimeFormat('en-US', {
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(d instanceof Date ? d : new Date(d))

/** Format date relative: "2 hours ago" */
export const fmtRelative = (d) => {
  const diff = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

/** Format expiry text */
export const fmtExpiry = (d) => {
  if (!d) return 'No expiry'

  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return 'No expiry'

  if (date.getTime() <= Date.now()) return 'Expired'

  return fmtDate(date)
}

/** Format expiry relative: "in 2d" / "expired 5h ago" */
export const fmtExpiryRelative = (d) => {
  if (!d) return 'No expiry'

  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return 'No expiry'

  const diff = date.getTime() - Date.now()
  const absDiff = Math.abs(diff)
  const mins = Math.floor(absDiff / 60_000)
  const hours = Math.floor(absDiff / 3_600_000)
  const days = Math.floor(absDiff / 86_400_000)

  if (diff <= 0) {
    if (mins < 60) return `expired ${Math.max(mins, 1)}m ago`
    if (hours < 24) return `expired ${hours}h ago`
    return `expired ${days}d ago`
  }

  if (mins < 60) return `in ${Math.max(mins, 1)}m`
  if (hours < 24) return `in ${hours}h`
  return `in ${days}d`
}

/** Classify expiry state for UI chips */
export const getExpiryState = (d) => {
  if (!d) return { label: 'No expiry', tone: 'neutral' }

  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return { label: 'No expiry', tone: 'neutral' }

  const diff = date.getTime() - Date.now()

  if (diff <= 0) return { label: 'Expired', tone: 'danger' }
  if (diff <= 3 * 86_400_000) return { label: 'Expiring soon', tone: 'warning' }

  return { label: 'Active', tone: 'success' }
}

/** Safe localStorage wrapper */
export const storage = {
  get: (key, fallback = null) => {
    try {
      const v = localStorage.getItem(key)
      return v !== null ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key) } catch {}
  },
}

/** Generate a unique blob name from a file (prevent duplicates) */
export const uniqueBlobName = (file) => {
  const ts   = Date.now()
  const rand = Math.random().toString(36).slice(2, 7)
  const ext  = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
  const base = file.name.replace(ext, '').slice(0, 40).replace(/\s+/g, '-')
  return `${base}-${ts}-${rand}${ext}`
}

/** Default network key */
export const DEFAULT_NETWORK = 'testnet'

/** Promise delay helper */
export const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/** Copy to clipboard */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Read a blob returned by ShelbyClient#download */
export const readShelbyBlob = async (blobResponse, mimeType = 'application/octet-stream') => {
  const stream = blobResponse?.readable

  if (!stream) {
    throw new Error('Shelby download stream not available')
  }

  const reader = stream.getReader()
  const chunks = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) chunks.push(value)
  }

  return new Blob(chunks, { type: mimeType })
}

/** Download a blob returned by ShelbyClient#download */
export const readShelbyBlobToFile = async (blobResponse, filename, mimeType = 'application/octet-stream') => {
  const blob = await readShelbyBlob(blobResponse, mimeType)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename || 'download.bin'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Detect lightweight preview support by file name or mime */
export const getPreviewKind = (filename = '', mimeType = '') => {
  const lowerName = filename.toLowerCase()
  const lowerMime = mimeType.toLowerCase()

  if (lowerMime.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lowerName)) return 'image'
  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf'
  if (
    lowerMime.startsWith('text/') ||
    /\.(txt|md|json|js|ts|tsx|jsx|css|html|xml|csv|log|yml|yaml)$/.test(lowerName)
  ) return 'text'

  return null
}

/** Build Shelby explorer URL for a transaction */
export const getExplorerUrl = (txHash, networkKey) => {
  // Import inline to avoid circular deps — networks.js imports nothing from utils
  const bases = {
    devnet:  'https://explorer.shelby.xyz/shelbynet/txn',
    testnet: 'https://explorer.shelby.xyz/testnet/txn',
  }
  const base = bases[networkKey] ?? bases.testnet
  return `${base}/${txHash}`
}

export const getBlobExplorerUrl = ({ owner, blobName, networkKey }) => {
  if (!owner || !blobName) return null

  const networkPath = networkKey === 'devnet' ? 'shelbynet' : 'testnet'
  return `https://explorer.shelby.xyz/${networkPath}/account/${owner}/blobs?name=${encodeURIComponent(blobName)}`
}
