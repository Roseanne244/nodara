import { X } from 'lucide-react'

export function PreviewModal({ open, title, subtitle, kind, objectUrl, textContent, onClose }) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(4,10,20,.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: 'min(920px, 100%)',
          maxHeight: '88vh',
          overflow: 'hidden',
          background: 'var(--surf)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-.03em',
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={title}
            >
              {title}
            </div>
            {subtitle && <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{subtitle}</div>}
          </div>

          <button className="btn btn-ghost" style={{ padding: '8px 10px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20, overflow: 'auto' }}>
          {kind === 'image' && objectUrl && (
            <img
              src={objectUrl}
              alt={title}
              style={{ display: 'block', maxWidth: '100%', margin: '0 auto', borderRadius: 12 }}
            />
          )}

          {kind === 'pdf' && objectUrl && (
            <iframe
              src={objectUrl}
              title={title}
              style={{ width: '100%', height: '72vh', border: 'none', borderRadius: 12, background: '#fff' }}
            />
          )}

          {kind === 'text' && (
            <pre
              style={{
                margin: 0,
                padding: 18,
                borderRadius: 12,
                background: 'var(--surf2)',
                color: 'var(--text)',
                fontSize: 12.5,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {textContent}
            </pre>
          )}

          {!kind && (
            <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>
              Preview is not available for this file type.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
