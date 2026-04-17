import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { NETWORKS } from '../lib/networks'

export function NetworkSelector({ networkKey, onSwitch }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const net = NETWORKS[networkKey]

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-outline"
        style={{ padding: '8px 13px', gap: 8, borderRadius: 12, background: 'rgba(255,255,255,.02)' }}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="dot pulse" style={{ background: net.color }} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>{net.short}</span>
        <ChevronDown
          size={13}
          style={{
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
          }}
        />
      </button>

      {open && (
        <div className="dropdown">
          <div
            style={{
              padding: '8px 12px 6px',
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.07em',
              color: 'var(--muted)',
            }}
          >
            Select Network
          </div>
          {Object.values(NETWORKS).map((item) => (
            <div
              key={item.key}
              className="dd-item"
              onClick={() => {
                onSwitch(item.key)
                setOpen(false)
              }}
            >
              <span className="dot" style={{ background: item.color }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                  {item.key === 'devnet' ? 'Prototype network - can reset or wipe' : 'Public Aptos testnet'}
                </div>
              </div>
              {item.key === networkKey && <Check size={13} color="var(--acc)" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
