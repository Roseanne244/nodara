import { lazy, Suspense, useMemo, useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  AlertTriangle,
  BarChart2,
  Clock,
  Globe,
  Network,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { NetworkSelector } from '../components/NetworkSelector'
import { WalletButton } from '../components/WalletButton'
import { NETWORKS } from '../lib/networks'
import { fmtAddress } from '../lib/utils'
import { hasShelbyApiKeyForNetwork } from '../lib/shelby'

const Overview = lazy(() => import('../modules/Overview').then((module) => ({ default: module.Overview })))
const UploadModule = lazy(() => import('../modules/Upload').then((module) => ({ default: module.UploadModule })))
const History = lazy(() => import('../modules/History').then((module) => ({ default: module.History })))

const NAV_ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <BarChart2 size={15} />,
    title: 'Storage Command Center',
    description: 'Track file activity, retention windows, and Shelby network health from one place.',
  },
  {
    key: 'upload',
    label: 'Upload',
    icon: <Upload size={15} />,
    title: 'Ship New Files',
    description: 'Prepare, sign, and publish blobs into Shelby with the current network configuration.',
  },
  {
    key: 'history',
    label: 'History',
    icon: <Clock size={15} />,
    title: 'Audit Uploaded Files',
    description: 'Search, sort, and manage stored blobs with expiry-aware controls.',
  },
]

export function Dashboard({ theme, toggleTheme, networkKey, onSwitchNetwork, onBack, onToast }) {
  const [tab, setTab] = useState('overview')
  const { account, connected } = useWallet()
  const net = NETWORKS[networkKey]
  const isPrototypeNetwork = networkKey === 'devnet'
  const activeTab = useMemo(() => NAV_ITEMS.find((item) => item.key === tab) ?? NAV_ITEMS[0], [tab])
  const hasApiKey = hasShelbyApiKeyForNetwork(networkKey)

  const handleUploadSuccess = ({ file, count }) => {
    if (count && count > 1) {
      onToast?.(`${count} files uploaded successfully!`, 'success')
    } else if (file?.name) {
      onToast?.(`${file.name} uploaded successfully!`, 'success')
    }
    setTimeout(() => setTab('history'), 1400)
  }

  const ModuleFallback = () => (
    <div
      className="card fade-in"
      style={{
        padding: 28,
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'linear-gradient(180deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%)',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: '2px solid rgba(108,92,231,.2)',
          borderTopColor: 'var(--acc)',
        }}
        className="spin"
      />
      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Loading module</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Preparing the {activeTab.label.toLowerCase()} workspace.</div>
      </div>
    </div>
  )

  return (
    <div className="dashboard-shell">
      <div className="dashboard-glow dashboard-glow-a" />
      <div className="dashboard-glow dashboard-glow-b" />

      <div className="sidebar">
        <div className="dashboard-sidebar-card dashboard-brand-card" style={{ marginBottom: 18 }}>
          <div className="dashboard-brand-head">
            <Logo size={24} />
            <span className="badge" style={{ color: 'var(--acc)', borderColor: 'rgba(108,92,231,.2)' }}>
              Shelby dApp
            </span>
          </div>
          <div className="dashboard-brand-title">
            Shelby storage workspace
          </div>
          <div className="dashboard-brand-copy">
            Upload, review, and manage files across Shelby Testnet and Shelbynet with wallet-aware actions.
          </div>
        </div>

        <div className="dashboard-sidebar-card" style={{ marginBottom: 18 }}>
          <div className="dashboard-sidebar-label">Active Network</div>
          <div className={`dashboard-network-banner${isPrototypeNetwork ? ' prototype' : ' stable'}`}>
            <div className="dashboard-network-banner-title">
              {isPrototypeNetwork ? 'Prototype network' : 'Stable test environment'}
            </div>
            <div className="dashboard-network-banner-copy">
              {isPrototypeNetwork ? 'Data can reset or wipe without notice' : 'Persistent testing with calmer network behavior'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="dot pulse" style={{ background: net.color, width: 10, height: 10 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{net.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {isPrototypeNetwork ? 'Shelby prototype storage environment with faucet support' : 'Public Aptos-aligned test environment'}
              </div>
            </div>
          </div>
          <div className="dashboard-network-grid">
            <div className={`dashboard-micro-card network${isPrototypeNetwork ? ' prototype' : ' stable'}`}>
              <div className="dashboard-micro-icon" style={{ color: net.color, background: net.dimColor }}>
                <Network size={14} color={net.color} />
              </div>
              <div className="dashboard-micro-body">
                <div className="dashboard-micro-value">{net.short}</div>
                <div className="dashboard-micro-copy">Network mode</div>
              </div>
            </div>
            <div className="dashboard-micro-card status">
              <div className="dashboard-micro-icon" style={{ color: 'var(--ok)', background: 'rgba(0,200,83,.12)' }}>
                <ShieldCheck size={14} color="var(--ok)" />
              </div>
              <div className="dashboard-micro-body">
                <div className="dashboard-micro-value">Ready</div>
                <div className="dashboard-micro-copy">SDK loaded</div>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="dashboard-sidebar-label" style={{ padding: '0 4px' }}>
            Workspace
          </div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              className={`nav-item${tab === item.key ? ' active' : ''}`}
              onClick={() => setTab(item.key)}
              style={{
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {tab === item.key && (
                <span className="badge" style={{ color: 'var(--acc)', borderColor: 'rgba(108,92,231,.2)' }}>
                  Active
                </span>
              )}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {connected && account?.address && (
            <div className="dashboard-sidebar-card" style={{ padding: 14 }}>
              <div className="dashboard-sidebar-label" style={{ marginBottom: 8 }}>
                Wallet Session
              </div>
              <code style={{ fontSize: 12, fontWeight: 600, display: 'block', color: 'var(--text)', marginBottom: 8 }}>
                {fmtAddress(account.address.toString())}
              </code>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                Transactions will be signed on {net.short}. Keep the wallet network aligned before uploading or deleting files.
              </div>
            </div>
          )}

          <div className="nav-item" onClick={onBack} style={{ color: 'var(--muted)', borderRadius: 12 }}>
            <Globe size={15} /> Back to Home
          </div>
        </div>
      </div>

      <div className="main-area">
        <div className="topbar">
          <div className="dashboard-topbar-copy">
            <div className="dashboard-topbar-title">{activeTab.title}</div>
            <div className="dashboard-topbar-subtitle">{activeTab.description}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <NetworkSelector networkKey={networkKey} onSwitch={onSwitchNetwork} />
            <ThemeToggle theme={theme} toggle={toggleTheme} />
            <WalletButton onToast={onToast} />
          </div>
        </div>

        <div className="page-content dashboard-page">
          <div className="dashboard-section-head">
            <div>
              <div className="dashboard-sidebar-label" style={{ marginBottom: 8 }}>
                Active Module
              </div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: '-.04em', marginBottom: 6 }}>
                {activeTab.label}
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 620, lineHeight: 1.65 }}>
                {activeTab.description}
              </div>
            </div>

            <div className="dashboard-summary-strip">
            <div className="dashboard-summary-chip">
              <span className="dot" style={{ background: net.color, width: 8, height: 8 }} />
              {net.short}
            </div>
            <div className={`dashboard-summary-chip${isPrototypeNetwork ? ' prototype' : ' stable'}`}>
              {isPrototypeNetwork ? 'Prototype / may wipe' : 'Testnet / safer persistence'}
            </div>
            <div className="dashboard-summary-chip">
              {connected ? fmtAddress(account?.address?.toString?.() ?? '') : 'Wallet idle'}
            </div>
          </div>
        </div>

          {isPrototypeNetwork && (
            <div className="alert-banner fade-in" style={{ marginBottom: 18, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)', color: '#fbbf24' }}>
              <AlertTriangle size={16} />
              <span style={{ flex: 1 }}>
                You are on <strong style={{ color: 'inherit' }}>Shelbynet</strong>, a prototype network that may be reset or wiped. Avoid treating stored files here as durable.
              </span>
            </div>
          )}

          {!hasApiKey && (
            <div className="alert-banner alert-warning fade-in" style={{ marginBottom: 18 }}>
              <AlertTriangle size={16} />
              <span style={{ flex: 1 }}>
                {net.label} is missing a Shelby API key in the current environment. Read-only and upload actions may fail with `401 Unauthorized`.
              </span>
            </div>
          )}

          <Suspense fallback={<ModuleFallback />}>
            {tab === 'overview' && <Overview networkKey={networkKey} onToast={onToast} />}
            {tab === 'upload' && (
              <UploadModule networkKey={networkKey} onSuccess={handleUploadSuccess} onToast={onToast} />
            )}
            {tab === 'history' && <History networkKey={networkKey} onToast={onToast} />}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
