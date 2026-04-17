import { createContext, useContext, useMemo } from 'react'
import { ShelbyClientProvider } from '@shelby-protocol/react'
import { createShelbyClient } from '../lib/shelby'

/**
 * Our own context that safely exposes the ShelbyClient reference.
 * Components can read this to know if Shelby is ready BEFORE
 * calling any @shelby-protocol/react hooks.
 */
const ShelbyCtx = createContext(null)

export function useShelbyClient() {
  return useContext(ShelbyCtx)
}

export function ShelbyProvider({ children, networkKey }) {
  const shelbyClient = useMemo(
    () => createShelbyClient(networkKey),
    [networkKey]
  )

  if (!shelbyClient) {
    console.error('[Nodara] ShelbyClient failed to initialize. Check src/lib/shelby.js import.')
    // Render children without Shelby — UI will show "not ready" state
    return (
      <ShelbyCtx.Provider value={null}>
        {children}
      </ShelbyCtx.Provider>
    )
  }

  return (
    <ShelbyCtx.Provider value={shelbyClient}>
      <ShelbyClientProvider client={shelbyClient}>
        {children}
      </ShelbyClientProvider>
    </ShelbyCtx.Provider>
  )
}
