import { AlertTriangle, X } from 'lucide-react'

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null

  const accent = tone === 'danger' ? '#ef4444' : 'var(--acc)'
  const surface = tone === 'danger' ? 'rgba(239,68,68,.08)' : 'rgba(108,92,231,.08)'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        background: 'rgba(4,10,20,.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={busy ? undefined : onClose}
    >
      <div
        className="card"
        style={{
          width: 'min(520px, 100%)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} color={accent} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '-.03em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={title}
              >
                {title}
              </div>
            </div>
          </div>

          <button className="btn btn-ghost" style={{ padding: '8px 10px' }} onClick={onClose} disabled={busy}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
            {description}
          </p>
        </div>

        <div
          style={{
            padding: '0 20px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            className={tone === 'danger' ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={onConfirm}
            disabled={busy}
            style={tone === 'danger' ? { background: accent, borderColor: accent } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
