# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

## Project Overview

react-redact is a React component library that lets you visually redact PII (personally identifiable information) with a single keyboard shortcut. The small visual toolkit is best-effort concealment, not a security boundary. Optional data, fields, Studio, and diagnostics entry points provide synthetic-only demo preparation. Never claim automatic scanning keeps originals out of SSR or newly inserted DOM.

## Structure

```
react-redact/
├── src/              # Library source code (components, hooks, utils)
├── apps/
│   ├── docs/         # Documentation site (Next.js + Fumadocs)
│   └── video/        # Video/studio content
├── dist/             # Built library output
└── package.json      # Root package (library)
```

## Commands

```bash
pnpm install          # Install dependencies
pnpm run build        # Build the library
pnpm run dev          # Dev server (library watch mode)
pnpm run check         # Lint with Biome

# Docs site (from apps/docs/)
pnpm run dev          # Dev server on port 3001
pnpm run build        # Build docs site
```

## Conventions

- **Package manager:** pnpm (monorepo workspaces)
- **Linting/formatting:** Biome
- **Docs framework:** Fumadocs (MDX content in `apps/docs/content/docs/`)
- **Styling:** Tailwind CSS
- **TypeScript:** Strict mode enabled
- **Exports:** Named exports preferred

## Architecture

- **RedactProvider** wraps the app and manages redaction state via React context
- **Redact** / **RedactAuto** are the consumer components that apply visual redaction
- **useRedactMode** / **useRedactPatterns** hooks expose redaction state
- Visual modes: `blur`, `mask`, `replace`, `secure` (compatibility name), `custom`
- `data.ts`: pure versioned policy validation and deterministic synthetic generation; no React/DOM
- `fields.tsx`: explicit render-time replacement and target registration
- `studio.tsx`: optional visual authoring; policy-only drafts/exports, no captured page text
- `diagnostics.ts`: bounded metadata-only preflight; never a security certification
- Built-in PII pattern matching (email, phone, SSN, credit card)
- Keyboard shortcut toggling is handled at the provider level

## Verification and releases

Run `pnpm validate`, the docs and Vite production builds, `pnpm test:package`, and the Playwright flows for relevant changes. The packed-consumer test includes a real Next App Router build. Keep client directives on React entry points only. Do not add GitHub CI workflows. Prepare a Changeset; publishing and deployment are separate explicit actions. Keep every feature MIT and sponsorship voluntary.
