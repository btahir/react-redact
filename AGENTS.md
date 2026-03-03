# AGENTS.md

This file provides guidance to AI coding agents working with this repository.

## Project Overview

react-redact is a React component library that lets you visually redact PII (personally identifiable information) with a single keyboard shortcut. Drop in a provider, hit ⌘⇧X (or Ctrl+Shift+X), and every sensitive field in your app is hidden — perfect for demos, screenshots, and screen shares. Supports blur, mask, and replace modes.

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
pnpm run lint         # Lint with Biome

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
- Three redaction modes: `blur`, `mask`, `replace`
- Built-in PII pattern matching (email, phone, SSN, credit card)
- Keyboard shortcut toggling is handled at the provider level
