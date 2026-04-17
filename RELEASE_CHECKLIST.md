# Nodara Release Checklist

Use this before:

- submitting to Vercel
- sharing with Shelby community users
- tagging a public demo build

## 1. Environment

- [ ] `.env.local` or Vercel env contains `VITE_SHELBY_API_KEY_TESTNET`
- [ ] `.env.local` or Vercel env contains `VITE_SHELBY_API_KEY_SHELBYNET`
- [ ] keys are confirmed to match the correct network scope
- [ ] no secrets are hardcoded in source files

## 2. Build

- [ ] `npm install` completes
- [ ] `npm run build` completes successfully
- [ ] `npm run preview` opens the production build locally
- [ ] Vercel preview deployment succeeds

## 3. Wallet

- [ ] wallet connects on Testnet
- [ ] wallet connects on Shelbynet
- [ ] wallet disconnect works cleanly
- [ ] wrong-wallet or rejected-signature flow shows clear feedback

## 4. Shelby Flows

Test on `testnet`:

- [ ] upload works
- [ ] history loads
- [ ] download works
- [ ] delete works
- [ ] expiry badges render correctly

Test on `shelbynet`:

- [ ] upload works
- [ ] history loads
- [ ] download works
- [ ] delete works
- [ ] expiry badges render correctly

## 5. Error Handling

- [ ] missing API key shows a clear warning
- [ ] invalid API key results in understandable error feedback
- [ ] empty history state looks intentional
- [ ] filtered-empty state looks intentional
- [ ] loading states do not shift layout badly

## 6. Deployment

- [ ] `vercel.json` SPA rewrite works on refresh
- [ ] landing page loads on deployed URL
- [ ] dashboard loads on deployed URL
- [ ] switching tabs after deploy does not break
- [ ] env vars are set in both Preview and Production if needed

## 7. Community Readiness

- [ ] README is up to date
- [ ] network naming is clear: users see `Shelbynet`, not `Devnet`
- [ ] faucet links are correct
- [ ] any experimental wording for Shelbynet is intentional
- [ ] community testers know which API keys or wallets are expected

## 8. Nice To Have Before Public Push

- [ ] screenshot or short demo clip for sharing
- [ ] project title and description finalized
- [ ] Vercel custom domain decided, if needed
- [ ] public announcement copy prepared
