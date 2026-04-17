# Nodara

Nodara is a Shelby-powered storage workspace for Aptos-native uploads, blob management, and explorer-based verification across **Shelby Testnet** and **Shelbynet**.

It is built for users who want a practical dApp, not just SDK examples:

- connect an Aptos wallet
- upload blobs with expiry presets
- inspect upload history
- preview, download, and delete stored files
- open blob and transaction views in Shelby Explorer
- switch safely between `Testnet` and `Shelbynet`

## Highlights

- **Dual-network support**
  Works across `Shelby Testnet` and `Shelbynet`.

- **Wallet-aware storage actions**
  Upload and delete flows are signed with an Aptos-compatible wallet.

- **Expiry-aware UX**
  Set blob expiry presets and review active, expiring, or expired files.

- **Explorer-linked history**
  Open transaction or blob details directly in Shelby Explorer.

- **Shelbynet-safe messaging**
  The UI clearly marks prototype-network behavior and warns when data may be reset or wiped.

## Supported Networks

| App key | UI label | Aptos network | Shelby network | Notes |
| --- | --- | --- | --- | --- |
| `testnet` | `Shelby Testnet` | `Network.TESTNET` | `Network.TESTNET` | public test environment |
| `devnet` | `Shelbynet` | `Network.SHELBYNET` | `Network.SHELBYNET` | prototype environment |

Notes:

- `devnet` is only kept as the **internal app key** for backward compatibility.
- In the UI and product copy, this environment is always treated as **Shelbynet**.

## Core Features

- wallet connect via `@aptos-labs/wallet-adapter-react`
- upload queue with multi-file support
- local preview before upload for image, text, and PDF files
- stored blob preview in dashboard history
- blob expiry presets:
  `7 days`, `14 days`, `30 days`, `60 days`, `90 days`, `360 days`
- download and delete actions
- bulk selection in history
- copy blob references and blob names
- Shelby Explorer integration
- network-specific API key handling for `Testnet` and `Shelbynet`

## Stack

- React
- Vite
- `@aptos-labs/ts-sdk`
- `@aptos-labs/wallet-adapter-react`
- `@shelby-protocol/sdk`
- `@shelby-protocol/react`
- `@tanstack/react-query`
- Recharts

## Requirements

- Node.js `20+` recommended
- an Aptos-compatible wallet such as Petra
- Shelby API keys for the networks you want to use

## Environment Variables

Copy `.env.example` and create `.env.local` in the project root.

Required:

```env
VITE_SHELBY_API_KEY_TESTNET=
VITE_SHELBY_API_KEY_SHELBYNET=
```

Optional legacy fallback:

```env
VITE_SHELBY_API_KEY=
```

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
npm run preview
```

## Deployment Notes

This project is prepared for static deployment with Vite output in `dist/`.

If you deploy later on Vercel:

1. import the repo
2. use the `Vite` framework preset
3. set build command to `npm run build`
4. set output directory to `dist`
5. add:
   `VITE_SHELBY_API_KEY_TESTNET`
   `VITE_SHELBY_API_KEY_SHELBYNET`

## Common Issues

### `401 Unauthorized`

Usually means the active network does not have a valid Shelby API key.

Check:

- `VITE_SHELBY_API_KEY_TESTNET`
- `VITE_SHELBY_API_KEY_SHELBYNET`

Restart the dev server after editing env files.

### Wallet connected but action fails

Check:

- selected app network
- wallet network
- faucet balance for the selected environment

### Shelbynet behaves differently from Testnet

That is expected.

`Shelbynet` is treated as a **prototype network** and may have different access controls, reset behavior, or wipe events.

## QA

Before public rollout, verify:

1. wallet connection
2. network switching
3. upload on both networks
4. history loading on both networks
5. preview, download, and delete flows
6. blob explorer and transaction explorer links
7. expiry preset behavior
8. invalid API key handling
9. desktop and mobile layout

Detailed references:

- [QA_PASS_SHEET.md](./QA_PASS_SHEET.md)
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

## Project Notes

- Shelby dependencies are pinned to avoid API drift.
- The app uses lazy loading for major screens and dashboard modules.
- `vite.config.ts` includes manual chunking to keep production output more stable.
- `.env.local` is ignored and should never be committed.

## Current Status

Nodara is already in a strong pre-release state for:

- GitHub showcase
- community review
- QA across Shelby environments

The next sensible step is final QA and then a preview deployment.
