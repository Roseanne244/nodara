import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'

/**
 * React Query client — all Shelby SDK hooks use this internally.
 * Configured with sensible defaults for a Web3 dApp.
 */
export function QueryProvider({ children }) {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry:              2,
        staleTime:          30_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  }), [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
