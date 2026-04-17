import { useState, useCallback } from 'react'
import { storage, DEFAULT_NETWORK } from '../lib/utils'
import { NETWORKS, getNetwork } from '../lib/networks'

const STORAGE_KEY = 'nodara-network'

/**
 * Manages the active Shelby/Aptos network.
 * Persists selection in localStorage.
 */
export function useNetwork() {
  const [networkKey, setNetworkKey] = useState(
    () => storage.get(STORAGE_KEY, DEFAULT_NETWORK)
  )

  const switchNetwork = useCallback((key) => {
    if (!NETWORKS[key]) return
    setNetworkKey(key)
    storage.set(STORAGE_KEY, key)
  }, [])

  return {
    networkKey,
    network: getNetwork(networkKey),
    switchNetwork,
    networks: NETWORKS,
  }
}
