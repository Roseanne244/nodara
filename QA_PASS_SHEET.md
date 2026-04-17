# Nodara QA Pass Sheet

Use this for manual validation before any public deployment or community share.

Status markers:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT TESTED`

Tester info:

- Date:
- Tester:
- Build source:
- Browser:
- Wallet used:

## Test Environment

### Shelby Testnet

- API key present: `YES / NO`
- Wallet funded: `YES / NO`
- Expected wallet network: `Testnet`

### Shelbynet

- API key present: `YES / NO`
- Wallet funded: `YES / NO`
- Expected wallet network: `Shelbynet`

## Global UX Checks

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| G-01 | App loads | Landing page renders without console-breaking error |  |  |
| G-02 | Theme toggle | Light/dark toggle works and persists |  |  |
| G-03 | Wallet picker | Connect UI opens and lists wallets |  |  |
| G-04 | Network selector | Shows `Shelbynet` and `Testnet`, not `Devnet` in user-facing copy |  |  |
| G-05 | Missing API key warning | Warning appears only when active network env is missing |  |  |
| G-06 | Tab switching | Overview, Upload, History switch cleanly |  |  |
| G-07 | Mobile layout | Core actions remain usable on narrow viewport |  |  |

## Testnet Flow

### Wallet and Network

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| T-W-01 | Switch to Testnet | Active network shows `Shelby Testnet` |  |  |
| T-W-02 | Connect wallet | Wallet address appears in sidebar/topbar |  |  |
| T-W-03 | Disconnect wallet | UI returns to disconnected state cleanly |  |  |

### Upload

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| T-U-01 | Select file | Selected file card shows name and size |  |  |
| T-U-02 | Upload start | Progress panel appears with staged flow |  |  |
| T-U-03 | Wallet approval | Wallet signature prompt appears |  |  |
| T-U-04 | Upload success | Success state appears and toast confirms upload |  |  |
| T-U-05 | Upload history redirect | App navigates to History after success |  |  |
| T-U-06 | API key failure | Invalid/missing key shows clear upload error |  |  |

### History

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| T-H-01 | History loads | Files list appears for connected wallet |  |  |
| T-H-02 | Search | Search filters current page correctly |  |  |
| T-H-03 | Sort | Sort order changes correctly |  |  |
| T-H-04 | Expiry filter | Active / expiring / expired / no expiry work |  |  |
| T-H-05 | Copy reference | Blob reference copies and success toast appears |  |  |
| T-H-06 | Download | File downloads successfully |  |  |
| T-H-07 | Delete | Delete removes file after confirm |  |  |
| T-H-08 | Empty filtered state | Empty state copy is intentional and clear |  |  |

### Overview

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| T-O-01 | Stats cards | Total uploads, total stored, active files, expiry watch render |  |  |
| T-O-02 | Charts | Upload activity and storage volume render |  |  |
| T-O-03 | Recent uploads | Latest files appear with expiry countdown |  |  |
| T-O-04 | Copy reference | Copy works from recent uploads row |  |  |
| T-O-05 | Download | Download works from recent uploads row |  |  |

## Shelbynet Flow

### Wallet and Network

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| S-W-01 | Switch to Shelbynet | Active network shows `Shelbynet` |  |  |
| S-W-02 | Connect wallet | Wallet address appears in sidebar/topbar |  |  |
| S-W-03 | Wrong env handling | User gets clear feedback if env/key is not ready |  |  |

### Upload

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| S-U-01 | Select file | Selected file card shows name and size |  |  |
| S-U-02 | Upload start | Progress panel appears with staged flow |  |  |
| S-U-03 | Wallet approval | Wallet signature prompt appears |  |  |
| S-U-04 | Upload success | Success state appears and toast confirms upload |  |  |
| S-U-05 | API key auth | No `401 Unauthorized` when correct key is set |  |  |

### History

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| S-H-01 | History loads | Files list appears for connected wallet |  |  |
| S-H-02 | Search/filter/sort | Controls behave the same as Testnet |  |  |
| S-H-03 | Copy reference | Blob reference copies and success toast appears |  |  |
| S-H-04 | Download | File downloads successfully |  |  |
| S-H-05 | Delete | Delete removes file after confirm |  |  |

### Overview

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| S-O-01 | Stats cards | Metrics render and do not show broken state |  |  |
| S-O-02 | Recent uploads | Recent files appear with expiry countdown |  |  |
| S-O-03 | Copy/download | Row actions work as expected |  |  |

## Error Handling

| ID | Check | Expected | Status | Notes |
| --- | --- | --- | --- | --- |
| E-01 | Missing wallet | Protected screens show connect state |  |  |
| E-02 | Missing Shelby client | Warning state appears instead of crash |  |  |
| E-03 | Missing API key | Warning or upload failure message is understandable |  |  |
| E-04 | Rejected signature | User gets explicit wallet rejection feedback |  |  |
| E-05 | Empty account | History and overview empty states look intentional |  |  |

## Final Sign-Off

- Ready for preview deploy: `YES / NO`
- Ready for community share: `YES / NO`
- Blocking issues:
- Follow-up issues:
