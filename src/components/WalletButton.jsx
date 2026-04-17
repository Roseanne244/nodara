import { useEffect, useRef, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  Wallet, ChevronDown, Copy, LogOut,
  CheckCircle, ExternalLink, AlertCircle,
} from 'lucide-react'
import { fmtAddress, copyToClipboard } from '../lib/utils'

/**
 * Real wallet connect/disconnect button using Aptos Wallet Adapter.
 * - Shows available wallets when not connected
 * - Shows address + options dropdown when connected
 */
export function WalletButton({ onToast }) {
  const {
    connect, disconnect,
    connected, connecting,
    account, wallets,
    isLoading,
  } = useWallet()

  const [open,       setOpen]       = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [copied,     setCopied]     = useState(false)
  const ref = useRef()

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleCopy = async () => {
    if (!account?.address) return
    const ok = await copyToClipboard(account.address.toString())
    if (ok) {
      setCopied(true)
      onToast?.('Address copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setOpen(false)
    onToast?.('Wallet disconnected', 'info')
  }

  const handleConnect = async (walletName) => {
    try {
      await connect(walletName)
      setShowPicker(false)
      onToast?.('Wallet connected!', 'success')
    } catch (err) {
      const msg = err?.message ?? ''
      if (msg.includes('not installed') || msg.includes('not found')) {
        onToast?.(`${walletName} is not installed. Please install it first.`, 'error')
      } else {
        onToast?.('Failed to connect wallet.', 'error')
      }
    }
  }

  // ── Not connected ──
  if (!connected) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          className="btn btn-primary glow-pulse"
          onClick={() => setShowPicker(o => !o)}
          disabled={connecting || isLoading}
        >
          {connecting || isLoading
            ? <><span className="spin" style={{ display:'inline-block',width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%'}}/>Connecting…</>
            : <><Wallet size={14} />Connect Wallet</>
          }
        </button>

        {/* Wallet picker dropdown */}
        {showPicker && (
          <div className="dropdown" style={{ right: 0, minWidth: 240 }}>
            <div style={{
              padding: '10px 12px 6px',
              fontSize: 10.5, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.07em',
              color: 'var(--muted)',
            }}>
              Choose Wallet
            </div>

            {wallets?.length > 0 ? wallets.map(w => (
              <div
                key={w.name}
                className="dd-item"
                onClick={() => handleConnect(w.name)}
              >
                {w.icon
                  ? <img src={w.icon} alt={w.name} style={{ width: 22, height: 22, borderRadius: 6 }} />
                  : <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--surf3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Wallet size={12} />
                    </div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {w.readyState === 'Installed' ? '✓ Installed' : 'Not installed'}
                  </div>
                </div>
                {w.readyState !== 'Installed' && (
                  <a
                    href={w.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ color: 'var(--acc)', fontSize: 11 }}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )) : (
              <div style={{ padding: '12px', textAlign: 'center' }}>
                <AlertCircle size={20} color="var(--warn)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  No wallets detected.<br />
                  <a href="https://petra.app" target="_blank" rel="noreferrer"
                    style={{ color: 'var(--acc)', fontWeight: 600 }}>
                    Install Petra Wallet
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Connected ──
  const addr = account?.address?.toString() ?? ''

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-outline"
        style={{ gap: 8 }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--grad)', flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {fmtAddress(addr)}
        </span>
        <ChevronDown size={13} style={{ opacity: .5 }} />
      </button>

      {open && (
        <div className="dropdown" style={{ minWidth: 260 }}>
          {/* Address display */}
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--border)',
            marginBottom: 4,
          }}>
            <div style={{
              fontSize: 10.5, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.07em',
              color: 'var(--muted)', marginBottom: 5,
            }}>
              Connected Wallet
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <code style={{ fontSize: 12, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>
                {fmtAddress(addr)}
              </code>
              <button
                className="btn btn-ghost"
                style={{ padding: '4px 8px', flexShrink: 0 }}
                onClick={handleCopy}
              >
                {copied ? <CheckCircle size={13} color="var(--ok)" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <div className="dd-item" onClick={handleDisconnect} style={{ color: 'var(--err)' }}>
            <LogOut size={14} /> Disconnect
          </div>
        </div>
      )}
    </div>
  )
}
