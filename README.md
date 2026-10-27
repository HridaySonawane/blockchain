# Proofcase — Digital Evidence Vault

A Next.js MVP for organizing digital evidence, recording SHA-256 fingerprints, and reviewing a linked custody ledger.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Included in this MVP

- Evidence dashboard with search, status filtering, file metadata, and case association.
- Upload flow that calculates a SHA-256 fingerprint in the browser and stores the original file in IndexedDB.
- LocalStorage records and a linked custody event ledger. Each event hash includes the previous event hash and the evidence fingerprint.
- Evidence detail drawer with custody events, fingerprint copy, integrity verification, and file download.
- Responsive layout and sample investigation records for the initial dashboard.

## Scope

This is a browser-local prototype. The custody hashes are linked locally; they are not submitted to a blockchain network. Browser storage is not a substitute for encrypted, access-controlled evidence storage or a production chain-of-custody system. Sample evidence records are illustrative and do not have corresponding file contents in IndexedDB.
