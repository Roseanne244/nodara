# Nodara

Nodara is a Shelby storage dashboard for Aptos wallets. It supports:

- Shelby Testnet
- Shelbynet
- wallet connect via `@aptos-labs/wallet-adapter-react`
- upload, list, download, delete
- expiry-aware file management

## What This App Is

This project is a community-facing dApp for Shelby users who need a practical interface to:

- upload blobs
- inspect stored files
- track expiry windows
- switch between Shelby Testnet and Shelbynet
- manage files with a connected Aptos wallet

It is not just a hackathon mockup anymore. The current build is structured for static deployment on Vercel.

## Supported Networks

| App key | Label | Aptos network | Shelby network |
| --- | --- | --- | --- |
| `testnet` | Shelby Testnet | `Network.TESTNET` | `Network.TESTNET` |
| `devnet` | Shelbynet | `Network.SHELBYNET` | `Network.SHELBYNET` |

Note:

- `devnet` is only the internal app key kept for backward compatibility.
- Everywhere in the UI and docs, this should be understood as `Shelbynet`.

## Requirements

- Node.js 20+ recommended
- an Aptos-compatible wallet such as Petra
- a Shelby API key for each network you want to use

## Environment Variables

Create `.env.local` in the project root.

Use the included `.env.example` as the template.

Required keys:

```env
VITE_SHELBY_API_KEY_TESTNET=...
VITE_SHELBY_API_KEY_SHELBYNET=...
```

Optional legacy fallback:

```env
VITE_SHELBY_API_KEY=...
```

## Local Development

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
npm run preview
```

## Deploy To Vercel

This repo is already configured as an SPA with [vercel.json](/c:/Users/User/Desktop/nodara-real/vercel.json:1).

Deployment checklist:

1. Import the repo into Vercel.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add env vars in the Vercel project:
   `VITE_SHELBY_API_KEY_TESTNET`
   `VITE_SHELBY_API_KEY_SHELBYNET`
6. Trigger a deploy.
7. Test both networks on the preview deployment before promoting to production.

## Manual QA Checklist

Before submission or public rollout, verify:

1. Wallet connect works.
2. Network switch works between Testnet and Shelbynet.
3. Upload succeeds on both networks.
4. History loads on both networks.
5. Download works.
6. Delete works.
7. Expiry badges render correctly.
8. Invalid API key produces a clear error state.
9. Refreshing the deployed app URL does not 404.
10. Mobile and desktop layouts remain usable.

For a more detailed test run, use [QA_PASS_SHEET.md](/c:/Users/User/Desktop/nodara-real/QA_PASS_SHEET.md:1).

## Common Issues

### `401 Unauthorized`

Usually means the network-specific Shelby API key is missing or invalid.

Check:

- `VITE_SHELBY_API_KEY_TESTNET`
- `VITE_SHELBY_API_KEY_SHELBYNET`

Restart the dev server after editing env files.

### Wallet connected but action fails

Check:

- the selected app network
- the wallet network
- faucet balance for the selected environment

### Shelbynet behaves differently from Testnet

That is expected. Shelbynet is a separate environment and may have different access controls or reset behavior.

## Current Stack

- React
- Vite
- `@aptos-labs/ts-sdk`
- `@aptos-labs/wallet-adapter-react`
- `@shelby-protocol/sdk`
- `@shelby-protocol/react`
- React Query

## Project Notes

- Shelby dependencies are pinned in `package.json` to avoid drift.
- The app uses lazy loading for major screens and dashboard modules.
- Vendor chunking is configured in [vite.config.ts](/c:/Users/User/Desktop/nodara-real/vite.config.ts:1) to keep production output more stable.

## Recommended Next Checks Before Public Share

- run a real Vercel preview with final env vars
- verify both networks from the deployed URL
- confirm API keys used for community access are the intended ones
- decide whether Shelbynet should be openly exposed or marked experimental in copy
