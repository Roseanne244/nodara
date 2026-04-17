import { Database } from 'lucide-react'

export function Logo({ size = 28 }) {
  const r = Math.round(size * 0.3)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size,
        background: 'var(--grad)',
        borderRadius: r,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Database size={size * 0.52} color="#fff" strokeWidth={2.5} />
      </div>
      <span style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 800,
        fontSize: size * 0.72,
        letterSpacing: '-.04em',
        color: 'var(--text)',
      }}>
        Nodara
      </span>
    </div>
  )
}
