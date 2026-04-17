import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle  size={15} color="var(--ok)"   />,
  error:   <AlertCircle  size={15} color="var(--err)"  />,
  warning: <AlertTriangle size={15} color="var(--warn)" />,
  info:    <Info          size={15} color="var(--acc)"  />,
}

const BORDERS = {
  success: 'var(--ok)',
  error:   'var(--err)',
  warning: 'var(--warn)',
  info:    'var(--acc)',
}

function ToastItem({ toast, onRemove }) {
  return (
    <div
      className="toast-item card"
      style={{
        padding: '12px 14px',
        minWidth: 280,
        maxWidth: 380,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderLeft: `3px solid ${BORDERS[toast.type] ?? BORDERS.info}`,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {ICONS[toast.type] ?? ICONS.info}
      <span style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        className="btn btn-ghost"
        style={{ padding: '2px 4px', flexShrink: 0 }}
        onClick={() => onRemove(toast.id)}
      >
        <X size={13} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
