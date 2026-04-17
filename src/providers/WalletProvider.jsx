import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { DEFAULT_NETWORK, NETWORKS } from '../lib/networks'

/**
 * Wraps the app with Aptos Wallet Adapter.
 * Petra dan wallet AIP-62 lainnya terdeteksi otomatis — tidak perlu plugin.
 */
export function WalletProvider({ children, networkKey }) {
  const net = NETWORKS[networkKey] ?? NETWORKS[DEFAULT_NETWORK]

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      optInWallets={["Petra"]}
      dappConfig={{
        network: net.aptosNetwork,
        aptosConnect: { dappName: 'Nodara' },
      }}
      onError={(err) => {
        console.error('[WalletProvider]', err)
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  )
}
