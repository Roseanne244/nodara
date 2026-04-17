import { Network } from '@aptos-labs/ts-sdk'

export const NETWORKS = {
  devnet: {
    key: 'devnet',
    displayKey: 'shelbynet',
    label: 'Shelbynet',
    short: 'Shelbynet',
    color: '#F59E0B',
    dimColor: 'rgba(245,158,11,0.15)',
    // Internal app key stays "devnet" only for backward compatibility.
    // This environment is Shelbynet, not Aptos Devnet.
    aptosNetwork: Network.SHELBYNET,
    shelbyNetwork: Network.SHELBYNET,
    explorerBase: 'https://explorer.shelby.xyz/shelbynet/txn',
    explorerSuffix: '',
    faucetUrl: 'https://faucet.shelbynet.shelby.xyz/fund?asset=shelbyusd',
  },
  testnet: {
    key: 'testnet',
    displayKey: 'testnet',
    label: 'Shelby Testnet',
    short: 'Testnet',
    color: '#10B981',
    dimColor: 'rgba(16,185,129,0.15)',
    aptosNetwork: Network.TESTNET,
    shelbyNetwork: Network.TESTNET,
    explorerBase: 'https://explorer.shelby.xyz/testnet/txn',
    explorerSuffix: '',
    faucetUrl: 'https://aptoslabs.com/testnet-faucet',
  },
}

export const DEFAULT_NETWORK = 'testnet'
export const getNetwork = (key) => NETWORKS[key] ?? NETWORKS[DEFAULT_NETWORK]
export const isShelbynetKey = (key) => key === 'devnet'
