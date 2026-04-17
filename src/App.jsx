import { lazy, Suspense, useState } from 'react'
import { QueryProvider } from './providers/QueryProvider'
import { WalletProvider } from './providers/WalletProvider'
import { ShelbyProvider } from './providers/ShelbyProvider'
import { ToastContainer } from './components/Toast'
import { useTheme } from './hooks/useTheme'
import { useNetwork } from './hooks/useNetwork'
import { useToast } from './hooks/useToast'
import { GLOBAL_STYLES } from './lib/styles'

const Landing = lazy(() => import('./pages/Landing').then((module) => ({ default: module.Landing })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })))

function AppScreenFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="card fade-in"
        style={{
          width: 'min(440px, 100%)',
          padding: 28,
          textAlign: 'center',
          borderRadius: 18,
          background: 'linear-gradient(180deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%)',
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            margin: '0 auto 16px',
            border: '3px solid rgba(108,92,231,.18)',
            borderTopColor: 'var(--acc)',
          }}
          className="spin"
        />
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Loading Nodara
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>
          Preparing the Shelby dashboard, wallet adapter, and network-aware storage client.
        </div>
      </div>
    </div>
  )
}

function AppShell({ networkKey, setNetworkKey }) {
  const { theme, toggleTheme } = useTheme()
  const { switchNetwork } = useNetwork()
  const { toasts, remove, success, error, info } = useToast()
  const [page, setPage] = useState('landing')

  const toast = (message, type = 'info') => {
    if (type === 'success') success(message)
    else if (type === 'error') error(message)
    else info(message)
  }

  const handleSwitchNetwork = (key) => {
    switchNetwork(key)
    setNetworkKey(key)
    info(`Switched to ${key === 'devnet' ? 'Shelbynet' : 'Shelby Testnet'}`)
  }

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        transition: 'background .25s, color .25s',
      }}
    >
      <style>{GLOBAL_STYLES}</style>

      <Suspense fallback={<AppScreenFallback />}>
        {page === 'landing' ? (
          <Landing
            onLaunch={() => setPage('dashboard')}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        ) : (
          <Dashboard
            theme={theme}
            toggleTheme={toggleTheme}
            networkKey={networkKey}
            onSwitchNetwork={handleSwitchNetwork}
            onBack={() => setPage('landing')}
            onToast={toast}
          />
        )}
      </Suspense>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </div>
  )
}

export default function App() {
  const getStoredNetwork = () => {
    try {
      return JSON.parse(localStorage.getItem('nodara-network')) ?? 'testnet'
    } catch {
      return 'testnet'
    }
  }

  const [networkKey, setNetworkKey] = useState(getStoredNetwork)

  return (
    <QueryProvider>
      <WalletProvider networkKey={networkKey}>
        <ShelbyProvider networkKey={networkKey}>
          <AppShell networkKey={networkKey} setNetworkKey={setNetworkKey} />
        </ShelbyProvider>
      </WalletProvider>
    </QueryProvider>
  )
}
