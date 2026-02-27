# react-redact — PRD

> One keyboard shortcut to make your entire app demo-safe.

---

## What It Is

`react-redact` is a zero-dependency React component library that visually hides personally identifiable information (PII) in your UI. It provides a `<Redact>` component, a `useRedactMode()` hook, and an auto-detection engine that finds and wraps PII in the DOM — all toggled by a single keyboard shortcut, hook, or URL param.

**This is NOT a server-side text processor.** Every existing PII redaction lib on npm (`redact-pii`, `@redactpii/node`, etc.) strips PII from strings on the backend. `react-redact` is the **first React UI-layer redaction library** — it visually blurs, masks, or replaces PII in the rendered DOM, in real time, with zero server calls.

---

## Who It's For

- **Developers** recording tutorials or streaming — toggle before recording
- **Sales engineers** doing live demos with real customer data — toggle during calls
- **Support teams** screensharing to debug — hide other customers' PII
- **QA teams** taking screenshots for bug reports — auto-redact sensitive data
- **Anyone** who pastes screenshots in Slack, Notion, or docs

---

## How It Works (Toggle Mechanism)

There is no screenshot/screen recording detection. This is a **manual toggle**, like a "demo mode" switch. Three activation methods:

1. **Keyboard shortcut** — `⌘⇧X` (configurable). Hit it before screenshare, hit again when done.
2. **Hook** — `const { isRedacted, toggle } = useRedactMode()`. Wire to any button, admin bar, dev toolbar.
3. **URL param / env var** — `?redact=true` or `NEXT_PUBLIC_REDACT=true`. Deploy a permanent demo environment.

---

## Core Architecture

### Technical Approach

The library is pure CSS tricks + React context + regex. No AI, no server, no heavy deps.

**Redaction modes (user picks per-component or globally):**

| Mode | How | Best For |
|---|---|---|
| **blur** | `filter: blur(6px)` on a `<span>` | Default. Fast, GPU-accelerated, visually obvious |
| **mask** | Replace text with `•••••` matching length via `ch` units | Clean look, copy-paste safe |
| **replace** | Swap with realistic fake data (e.g. `user@example.com` → `jane@demo.com`) | Demos where data needs to look real |
| **custom** | User provides their own render function | Full control |

**Auto-detection engine:**

Walks text nodes in the DOM, matches against regex patterns, wraps matches in invisible `<span data-redact>` elements. Patterns:

| Type | Pattern | Example |
|---|---|---|
| `email` | Standard RFC-ish email regex | `user@company.com` |
| `phone` | US/intl phone formats | `(555) 555-0123`, `+1-555-555-0123` |
| `ssn` | `XXX-XX-XXXX` | `123-45-6789` |
| `credit-card` | Luhn-valid 13-19 digit sequences | `4111 1111 1111 1111` |
| `ip` | IPv4 and IPv6 | `192.168.1.1` |
| `custom` | User-provided regex or function | Anything |

**Security considerations for redacted content:**

- `user-select: none` — prevents copy-paste of blurred content
- `aria-hidden="true"` on blurred spans — screen readers skip redacted content
- Actual text node content is NOT removed from DOM (blur mode) — this is visual-only, not a security boundary. PRD and README must clearly state: "This is a UI convenience tool, not a security product. The underlying data remains in the DOM."

### Performance

- GPU-accelerated `filter: blur()` — hardware composited, no layout thrash
- `content-visibility: auto` on large redacted sections for render skip
- MutationObserver (not polling) for auto-detection on dynamic content
- Debounced DOM walks — max 1 scan per 100ms on mutations
- Regex patterns are pre-compiled once, reused across scans

---

## API Design

### Components

```tsx
// 1. Provider — wrap your app (or a subtree)
import { RedactProvider } from 'react-redact'

<RedactProvider
  mode="blur"                    // 'blur' | 'mask' | 'replace' | 'custom'
  shortcut="mod+shift+x"        // keyboard shortcut, 'mod' = ⌘/Ctrl
  autoDetect={['email', 'phone', 'ssn', 'credit-card']}  // or false
  enabled={false}               // initial state
  customPatterns={[/ACME-\d{6}/g]}  // additional patterns
>
  <App />
</RedactProvider>

// 2. Manual redaction — wrap known sensitive content
import { Redact } from 'react-redact'

<Redact>john.doe@company.com</Redact>
<Redact mode="replace" replacement="Jane Smith">John Doe</Redact>
<Redact mode="mask">4111 1111 1111 1111</Redact>

// 3. Hook — read/control redact state
import { useRedactMode } from 'react-redact'

function AdminBar() {
  const { isRedacted, enable, disable, toggle } = useRedactMode()
  return <button onClick={toggle}>{isRedacted ? '🔒' : '🔓'} Demo Mode</button>
}

// 4. Auto-detection — scans children for PII patterns
import { RedactAuto } from 'react-redact'

<RedactAuto patterns={['email', 'phone']}>
  <UserProfile />  {/* any emails/phones in here get auto-wrapped */}
</RedactAuto>
```

### Exports

```
react-redact
├── RedactProvider       — context provider, global config
├── Redact               — manual redaction wrapper component
├── RedactAuto           — auto-detection scanner component
├── useRedactMode        — hook: { isRedacted, enable, disable, toggle }
├── useRedactPatterns    — hook: get/extend active patterns
├── patterns             — built-in regex patterns (email, phone, ssn, etc.)
└── createPattern        — helper to create custom pattern configs
```

---

## Toolchain (2026 Best-in-Class)

Every dependency chosen for a reason. This is what "lean and mean" looks like in 2026.

### Build & Bundle

| Tool | Why | Replaces |
|---|---|---|
| **tsdown** | Rolldown-powered library bundler. ESM-first, blazing fast dts generation via Oxc. The successor to tsup — from the Vite/Rolldown/Oxc ecosystem (void(0)). Compatible with tsup config but faster, better ESM output, proper file extensions. | tsup, rollup, esbuild |
| **TypeScript 5.x** | Strict mode. `moduleResolution: "bundler"`. | — |
| **pnpm** | Fast, disk-efficient, strict dependency resolution. | npm, yarn |

### Code Quality

| Tool | Why | Replaces |
|---|---|---|
| **Biome v2.3+** | Single binary. Linting + formatting. 10-100x faster than ESLint+Prettier. One `biome.json` config replaces `.eslintrc` + `.prettierrc` + 6 plugins. 423+ lint rules including React domain rules. | ESLint, Prettier, eslint-plugin-react, eslint-config-prettier, etc. |

### Testing

| Tool | Why | Replaces |
|---|---|---|
| **Vitest** | Native ESM, 10-20x faster than Jest, Jest-compatible API, shares Vite config. The standard for new React libraries in 2026. | Jest |
| **@testing-library/react** | User-centric component testing. Test behavior, not implementation. | Enzyme |
| **jsdom** | DOM environment for Vitest. Needed for `filter: blur()` and `MutationObserver` testing. | — |

### Versioning & Publishing

| Tool | Why | Replaces |
|---|---|---|
| **Changesets** | Captures release intent at contribution time. Automated semver bumps, changelog generation, GitHub release creation. Industry standard for OS libraries (used by Radix, shadcn, Chakra). | manual `npm version`, semantic-release |

### Docs Site

| Tool | Why | Replaces |
|---|---|---|
| **Fumadocs** | The React.js docs framework. Built on Next.js, stunning default UI, MDX support, component previews. Since react-redact IS a React library, the docs should showcase React components natively — not through Vue (VitePress) or Astro. | VitePress, Starlight, Nextra, Docusaurus |

### Distribution Strategy (Dual)

1. **npm package** — `npm install react-redact` — traditional import
2. **shadcn registry** — `npx shadcn add @redact/react` — copy-paste model for users who want to own the code. Since react-redact components are small and self-contained, this model works perfectly.

---

## Project Structure (Single Package, Not Monorepo)

react-redact is a single focused library. No monorepo needed (unlike react-kino which has a core engine + React wrapper). Keep it simple.

```
react-redact/
├── src/
│   ├── index.ts                    # public API barrel export
│   ├── redact-provider.tsx         # context provider + keyboard shortcut
│   ├── redact.tsx                  # <Redact> manual wrapper component
│   ├── redact-auto.tsx             # <RedactAuto> scanner component
│   ├── use-redact-mode.ts          # main hook
│   ├── use-redact-patterns.ts      # patterns hook
│   ├── context.ts                  # React context definition
│   ├── scanner.ts                  # MutationObserver + DOM walker
│   ├── patterns/
│   │   ├── index.ts                # pattern registry + createPattern
│   │   ├── email.ts                # email regex
│   │   ├── phone.ts                # phone regex
│   │   ├── ssn.ts                  # SSN regex
│   │   ├── credit-card.ts          # credit card regex (with Luhn)
│   │   └── ip.ts                   # IPv4/IPv6 regex
│   ├── modes/
│   │   ├── index.ts                # mode registry
│   │   ├── blur.ts                 # blur mode styles + logic
│   │   ├── mask.ts                 # mask mode (bullet replacement)
│   │   └── replace.ts              # replace mode (fake data generation)
│   ├── utils/
│   │   ├── keyboard.ts             # shortcut parser + listener
│   │   ├── dom-walker.ts           # text node traversal
│   │   └── fake-data.ts            # replacement data generators
│   └── styles/
│       └── redact.css              # minimal CSS (blur, transitions)
├── tests/
│   ├── redact-provider.test.tsx
│   ├── redact.test.tsx
│   ├── redact-auto.test.tsx
│   ├── use-redact-mode.test.ts
│   ├── scanner.test.ts
│   ├── patterns/
│   │   ├── email.test.ts
│   │   ├── phone.test.ts
│   │   ├── ssn.test.ts
│   │   ├── credit-card.test.ts
│   │   └── ip.test.ts
│   └── modes/
│       ├── blur.test.ts
│       ├── mask.test.ts
│       └── replace.test.ts
├── apps/
│   └── docs/                       # Fumadocs site (Next.js)
│       ├── app/
│       ├── content/
│       │   └── docs/
│       │       ├── index.mdx       # getting started
│       │       ├── components/
│       │       │   ├── redact.mdx
│       │       │   ├── redact-auto.mdx
│       │       │   └── provider.mdx
│       │       ├── hooks/
│       │       │   └── use-redact-mode.mdx
│       │       ├── modes.mdx
│       │       ├── patterns.mdx
│       │       └── recipes.mdx     # real-world usage patterns
│       └── components/
│           └── demo/               # interactive demos for docs
├── tsdown.config.ts
├── tsconfig.json
├── biome.json
├── vitest.config.ts
├── package.json
├── .changeset/
│   └── config.json
├── .github/
│   └── workflows/
│       ├── ci.yml                  # lint + test + build on PR
│       └── release.yml             # changesets publish on merge to main
├── LICENSE                         # MIT
└── README.md
```

**All file names are kebab-case.** Components: `redact-provider.tsx`, `redact-auto.tsx`. Hooks: `use-redact-mode.ts`. Patterns: `credit-card.ts`. Tests mirror source: `redact-provider.test.tsx`.

---

## Config Files

### package.json

```json
{
  "name": "react-redact",
  "version": "0.1.0",
  "description": "One keyboard shortcut to make your entire app demo-safe",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./styles.css": "./dist/styles/redact.css"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist", "README.md", "LICENSE"],
  "sideEffects": ["*.css"],
  "keywords": [
    "react", "redact", "pii", "privacy", "blur", "mask",
    "demo-mode", "screenshare", "sensitive-data", "gdpr"
  ],
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.3.0",
    "@changesets/cli": "^2.27.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tsdown": "^0.6.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  },
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "check": "biome check .",
    "check:fix": "biome check --fix .",
    "prepublishOnly": "pnpm run build",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm run build && changeset publish"
  }
}
```

**ESM-only.** No CJS output. 2026 is the year of ESM — Node 20+ supports importing ESM from CJS, and every non-EOL Node version handles it. One output format = simpler build, smaller package, zero dual-package hazard.

### tsdown.config.ts

```typescript
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests", "apps"]
}
```

### biome.json

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.0/schema.json",
  "organizeImports": { "enabled": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true },
    "domains": {
      "react": "recommended"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/index.ts'],
      thresholds: { branches: 80, functions: 80, lines: 80 },
    },
  },
})
```

### .changeset/config.json

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

---

## Milestones

### Week 1 — Core (Ship the "blur + toggle" loop)

**Goal:** A working `RedactProvider` + `Redact` + `useRedactMode` with blur mode and keyboard shortcut.

- [ ] Scaffold project: `pnpm init`, install all devDeps, configure tsdown/biome/vitest
- [ ] `context.ts` — React context with redact state
- [ ] `redact-provider.tsx` — provider component with keyboard shortcut listener
- [ ] `redact.tsx` — `<Redact>` component with blur mode (`filter: blur(6px)`, transition)
- [ ] `use-redact-mode.ts` — hook returning `{ isRedacted, enable, disable, toggle }`
- [ ] `utils/keyboard.ts` — shortcut parser (handle `mod+shift+x` cross-platform)
- [ ] `styles/redact.css` — blur transition, `user-select: none`, `aria-hidden`
- [ ] `index.ts` — barrel export
- [ ] Tests for provider, component, hook, keyboard util
- [ ] Build succeeds, `pnpm pack` produces clean tarball
- [ ] README with basic usage example + GIF

### Week 2 — Modes + Patterns

**Goal:** All three redaction modes work. Auto-detection scans DOM for PII.

- [ ] `modes/blur.ts` — extract blur logic into mode module
- [ ] `modes/mask.ts` — bullet replacement with `ch` unit width matching
- [ ] `modes/replace.ts` — fake data generators (emails, phones, names, IPs)
- [ ] `utils/fake-data.ts` — deterministic fake data (seeded by original value hash for consistency)
- [ ] `patterns/*.ts` — all 5 built-in patterns with tests
- [ ] `patterns/credit-card.ts` — includes Luhn validation to reduce false positives
- [ ] `scanner.ts` — MutationObserver + TreeWalker for text node scanning
- [ ] `redact-auto.tsx` — `<RedactAuto>` component using scanner
- [ ] `use-redact-patterns.ts` — hook for reading/extending patterns
- [ ] `utils/dom-walker.ts` — efficient text node traversal with debouncing
- [ ] Tests for all patterns (true positives AND false positive rejection)
- [ ] Tests for scanner (MutationObserver, dynamic content)
- [ ] Mode prop on `<Redact>` and `<RedactProvider>` works correctly

### Week 3 — Docs + Polish + Launch

**Goal:** Beautiful docs site. Published to npm. Launch on Reddit/HN/Twitter.

- [ ] Fumadocs site scaffold in `apps/docs/`
- [ ] Interactive demos: live toggle, mode comparison, auto-detect playground
- [ ] Getting Started guide, API reference for each component/hook
- [ ] "Recipes" page: Next.js admin panel, SaaS dashboard demo mode, Storybook integration
- [ ] README with badges, GIF demos, feature matrix
- [ ] GitHub Actions CI (lint + test + build on PR)
- [ ] GitHub Actions release (changesets publish on merge to main)
- [ ] `npm publish` as `react-redact@0.1.0`
- [ ] shadcn registry entry (optional, post-launch)
- [ ] Launch: r/reactjs, r/webdev, Twitter, HN Show

---

## Design Decisions

1. **Kebab-case file names everywhere.** `redact-provider.tsx`, `use-redact-mode.ts`, `credit-card.ts`, `dom-walker.ts`. No camelCase files, no PascalCase files. Components are PascalCase in code, kebab-case on disk.

2. **Zero runtime dependencies.** Only React as a peer dep. No Framer Motion, no lodash, no nothing. Every byte must justify its existence. Target: **< 3KB gzipped**.

3. **ESM-only output.** No CJS. 2026 ecosystem is ESM-native. One format = simpler build, no dual-package hazard, smaller package.

4. **tsdown over tsup.** Rolldown/Oxc-powered, faster dts generation, ESM-first design, better file extension handling. Compatible with tsup config but strictly better for ESM libraries.

5. **Biome over ESLint + Prettier.** One tool, one config file, 10-100x faster. v2.3 has 423+ rules including React domain. No more plugin hell.

6. **Vitest over Jest.** Native ESM, 10-20x faster, Jest-compatible API. The standard for new React libraries.

7. **Fumadocs over VitePress/Starlight.** React-native docs framework — can embed actual `<Redact>` components in docs as live demos. VitePress is Vue-based, Starlight is Astro-based.

8. **Visual-only, not security.** Clear messaging: this blurs PII visually. It does NOT remove data from the DOM. It's a demo/screenshare convenience tool. This is a feature, not a bug — it means zero impact on app logic or state.

9. **Single package, not monorepo.** react-redact is one focused library. No core/react split needed (unlike react-kino). Monorepo adds complexity with zero benefit here. If we add a CLI later, we can monorepo then.

10. **Changesets for releases.** Industry standard. Captures intent at PR time, auto-generates changelog, automated npm publish via GitHub Actions. No manual version bumping.

---

## Competitive Landscape

| Existing | What It Does | Gap |
|---|---|---|
| `redact-pii` (npm) | Server-side text string redaction | Not React, not visual, backend only |
| `@redactpii/node` (npm) | Regex PII redaction for Node.js | Not React, not visual, backend only |
| Google DLP API | Cloud PII detection + redaction | Server-side, requires API key, costs money |
| Manual CSS blur | `filter: blur()` in devtools | No toggle, no auto-detect, no component model |

**react-redact occupies a gap that literally no one has filled.** Every PII tool is server-side text processing. There is ZERO React UI-layer redaction with auto-detect + toggle + multiple modes.

---

## Launch Strategy

### README First Impressions

The README GIF is everything. Show:
1. A dashboard with real-looking data
2. User hits `⌘⇧X`
3. All PII blurs simultaneously with a smooth CSS transition
4. User hits it again, everything's back

This GIF will get screenshots on Twitter. That's the viral loop.

### Channel Priority

1. **r/reactjs** — "I built react-redact: one shortcut to blur all PII in your app" (show GIF)
2. **r/webdev** — broader audience, same GIF
3. **Twitter/X** — tag React influencers, show before/after
4. **Hacker News** — Show HN with privacy/GDPR angle
5. **Dev.to** — tutorial post: "How to add demo mode to your SaaS in 5 minutes"

### Messaging

- **Tagline:** "One keyboard shortcut to make your entire app demo-safe."
- **Hook:** "Every SaaS developer has accidentally shown customer PII on a screenshare. Never again."
- **Technical hook:** "3KB. Zero deps. Works with any React app. Progressive — blur, mask, or replace."

---

## Post-MVP Roadmap

- **v0.2** — `<RedactImage>` component (blur faces/text in images via CSS, no ML)
- **v0.3** — React DevTools integration (highlight all redacted elements)
- **v0.4** — Playwright/Cypress plugin (auto-enable redact mode in E2E screenshots)
- **v0.5** — VS Code extension (toggle redact mode in Storybook preview)
- **v1.0** — Stable API, full test coverage, i18n pattern packs (EU phone formats, IBAN, etc.)

---

## Success Metrics

| Metric | 1 Month | 3 Months | 6 Months |
|---|---|---|---|
| npm weekly downloads | 500 | 5,000 | 20,000 |
| GitHub stars | 500 | 3,000 | 10,000 |
| Bundle size (gzipped) | < 3KB | < 3KB | < 4KB |
| Open issues | < 10 | < 20 | < 30 |
| Contributors | 1 | 5 | 15 |