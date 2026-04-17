import { ShelbyClient } from '@shelby-protocol/sdk/browser'
import { getNetwork } from './networks'

const SHELBY_API_KEYS = {
  shelbynet:
    import.meta.env.VITE_SHELBY_API_KEY_SHELBYNET ||
    import.meta.env.VITE_SHELBY_API_KEY ||
    undefined,
  testnet:
    import.meta.env.VITE_SHELBY_API_KEY_TESTNET ||
    import.meta.env.VITE_SHELBY_API_KEY ||
    undefined,
}

function normalizeShelbyKey(networkKey) {
  if (networkKey === 'devnet') return 'shelbynet'
  return networkKey
}

function getShelbyApiKey(networkKey) {
  return SHELBY_API_KEYS[normalizeShelbyKey(networkKey)] || undefined
}

export function hasShelbyApiKeyForNetwork(networkKey) {
  return !!getShelbyApiKey(networkKey)
}

for (const networkKey of ['shelbynet', 'testnet']) {
  const apiKey = getShelbyApiKey(networkKey)
  if (apiKey) {
    console.log(`[Nodara] Shelby API key loaded for ${networkKey}:`, `${apiKey.slice(0, 10)}...`)
  } else {
    console.warn(`[Nodara] No Shelby API key found for ${networkKey} - indexer requests may fail with 401`)
  }
}

export function createShelbyClient(networkKey) {
  const net = getNetwork(networkKey)
  const apiKey = getShelbyApiKey(net.key)

  try {
    const config = {
      network: net.shelbyNetwork,
      ...(apiKey ? {
        apiKey,
        indexer: { apiKey },
      } : {}),
    }

    console.log(
      `[Nodara] Creating ShelbyClient for ${networkKey} (${net.shelbyNetwork}) with apiKey=${apiKey ? 'yes' : 'no'}`
    )

    return new ShelbyClient(config)
  } catch (err) {
    console.error('[Nodara] Failed to create ShelbyClient:', err)
    return null
  }
}

export async function probeShelbyIndexerAuth(networkKey) {
  const net = getNetwork(networkKey)
  const apiKey = getShelbyApiKey(net.key)
  const normalizedKey = normalizeShelbyKey(net.key)

  const url = {
    shelbynet: 'https://api.shelbynet.aptoslabs.com/nocode/v1/public/alias/shelby/shelbynet/v1/graphql',
    testnet: 'https://api.testnet.aptoslabs.com/nocode/v1/public/alias/shelby/testnet/v1/graphql',
  }[normalizedKey]

  if (!url) {
    return {
      ok: false,
      status: 0,
      statusText: 'Unsupported network',
      url: null,
      hasApiKey: !!apiKey,
      body: null,
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      query: 'query ShelbyAuthProbe { __typename }',
    }),
  })

  const body = await response.text()

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    url,
    hasApiKey: !!apiKey,
    body,
  }
}

if (typeof window !== 'undefined') {
  window.__nodaraShelbyDebug = {
    get hasApiKeys() {
      return {
        shelbynet: !!SHELBY_API_KEYS.shelbynet,
        testnet: !!SHELBY_API_KEYS.testnet,
      }
    },
    get apiKeyPreview() {
      return {
        shelbynet: SHELBY_API_KEYS.shelbynet ? `${SHELBY_API_KEYS.shelbynet.slice(0, 10)}...` : null,
        testnet: SHELBY_API_KEYS.testnet ? `${SHELBY_API_KEYS.testnet.slice(0, 10)}...` : null,
      }
    },
    getShelbyApiKey,
    probeShelbyIndexerAuth,
  }
}
