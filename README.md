<div align="center">

# react-redact

[![npm version](https://img.shields.io/npm/v/react-redact?color=blue)](https://www.npmjs.com/package/react-redact)
[![npm downloads](https://img.shields.io/npm/dm/react-redact)](https://www.npmjs.com/package/react-redact)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-redact)](https://bundlephobia.com/package/react-redact)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

**One keyboard shortcut to make your entire app demo-safe.**

Zero-dependency React components that visually hide PII — for demos, screenshares, and presentations.

</div>

---

<div align="center">
  <img src="https://raw.githubusercontent.com/btahir/react-redact/main/apps/docs/public/hero.gif" alt="react-redact demo" width="830" />
</div>

> **⚠️ Visual-only — not a security boundary.** react-redact hides PII on screen; it does not remove
> it from the page. The real value is still sitting in the DOM (and, for `<RedactAuto>`, in a
> `data-redact-original` attribute) and can be read via "View Source", browser dev tools, the
> accessibility tree, or a few lines of JS — by you or anyone watching your screenshare over a
> screen-recording pipeline that captures the DOM rather than pixels. Never use it in place of
> real server-side redaction, and never rely on it to protect data from a technically curious
> viewer. See [Security model](#security-model) for the full breakdown.

> **Blur works with zero CSS.** `mode="blur"` applies `filter: blur(...)` as an inline style, so it's visually safe even if you forget to import `react-redact/styles.css`. The stylesheet is entirely optional — import it only if you want the `react-redact-blur` class override hook or the opt-in `.react-redact-section` `content-visibility` helper.

<div align="center">
  <img src="https://raw.githubusercontent.com/btahir/react-redact/main/apps/docs/public/ph-1.png" alt="Before and after redaction" width="700" />
</div>

## Why react-redact?

You're about to share your screen. Your app is full of real customer data — emails, phone numbers, credit cards. You need to hide it **now**, not refactor your entire data layer.

**react-redact** solves this in one line: wrap your app in `<RedactProvider>`, press `⌘⇧X`, and every marked piece of PII is instantly blurred, masked, or replaced with fake data. No backend changes. No environment switching. Just a keyboard shortcut.

## Features

- **Instant toggle** — Keyboard shortcut (`⌘⇧X` / `Ctrl+Shift+X`), `useRedactMode()` hook, or `?redact=true` URL param
- **Three modes** — Blur, mask (bullets), or replace with deterministic fake data
- **Manual wrapping** — `<Redact>` component for known PII fields
- **Auto-detection** — `<RedactAuto>` scans subtrees for email, phone, SSN, credit card, IP (+ custom regex)
- **Custom mode** — Bring your own render function for full control
- **Zero dependencies** — React is the only peer dep. ESM + CJS, tree-shakeable
- **Next.js ready** — `"use client"` directives included, works with App Router out of the box
- **TypeScript-first** — Strict types, exported interfaces, `isolatedDeclarations` compatible

## Install

```bash
npm install react-redact
```

## Quick Start

```tsx
import { RedactProvider, Redact, useRedactMode } from "react-redact";
import "react-redact/styles.css"; // optional — blur works without it, see note above

function App() {
  return (
    <RedactProvider shortcut="mod+shift+x">
      <Dashboard />
    </RedactProvider>
  );
}

function Dashboard() {
  const { isRedacted, toggle } = useRedactMode();
  return (
    <>
      <button onClick={toggle}>{isRedacted ? "🔒" : "🔓"} Demo mode</button>
      <p>Email: <Redact>user@company.com</Redact></p>
      <p>Phone: <Redact>(555) 123-4567</Redact></p>
    </>
  );
}
```

Press **⌘⇧X** (Mac) or **Ctrl+Shift+X** (Windows/Linux) to toggle.

### Other ways to toggle

`useRedactMode()` also exposes the active `mode`, so you can react to it in your own UI:

```tsx
const { isRedacted, mode, enable, disable, toggle } = useRedactMode();
```

Change the keyboard shortcut via `<RedactProvider shortcut="mod+shift+r">` (`mod` = ⌘ on Mac,
Ctrl elsewhere), or skip the shortcut entirely by passing `shortcut=""`/`shortcut={undefined}` and
driving `enable`/`disable`/`toggle` yourself.

For permanent demo environments, load the page with `?redact=true` (or `?redact=1`) and read it
with `getInitialRedactEnabled()`:

```tsx
import { RedactProvider, getInitialRedactEnabled } from "react-redact";

<RedactProvider enabled={getInitialRedactEnabled()}>
  <App />
</RedactProvider>
```

`getInitialRedactEnabled()` reads `window.location.search` and returns `false` during SSR (no
`window`) — for an env-based default that also works server-side, resolve it in your own app code
and pass the result as `enabled`.

## Modes

<div align="center">
  <img src="https://raw.githubusercontent.com/btahir/react-redact/main/apps/docs/public/ph-2.png" alt="Three redaction modes — blur, mask, replace" width="700" />
</div>

| Mode | What it does | Example output |
|------|-------------|----------------|
| **Blur** | Inline `filter: blur(...)` over original text (no CSS import required) | ░░░░░░░░░░░ |
| **Mask** | Replaces each character with a repeated mask character | `•••••••••••` |
| **Replace** | Deterministic fake data (same input → same output) | `jane.doe@example.com` |

```tsx
<RedactProvider mode="blur">   {/* default */}
<RedactProvider mode="mask">
<RedactProvider mode="replace">

{/* Or per-component: */}
<Redact mode="replace">user@company.com</Redact>
```

Blur radius and mask character are configurable, at the provider (as defaults) or per-`<Redact>`/`<RedactAuto>` (as overrides):

```tsx
<RedactProvider blurRadius={10} maskChar="*">
  <App />
</RedactProvider>

{/* Override for one field: */}
<Redact blurRadius={2}>user@company.com</Redact>
<Redact mode="mask" maskChar="#">123-45-6789</Redact>
```

> **Note:** Mask/replace need real text to compute a bullet count or fake value. Passing a
> React element (rather than a plain string) as `<Redact>` children falls back to a fixed-length
> placeholder and logs a dev-only console warning — use `mode="blur"` or `mode="custom"` for
> non-text children instead.

## Auto-Detection

<div align="center">
  <img src="https://raw.githubusercontent.com/btahir/react-redact/main/apps/docs/public/ph-4.png" alt="Auto-detect PII patterns" width="700" />
</div>

`<RedactAuto>` scans DOM text nodes for PII patterns and wraps matches automatically:

```tsx
<RedactAuto patterns={["email", "phone", "ssn", "credit-card", "ip"]}>
  <div>{/* any content — PII gets auto-wrapped */}</div>
</RedactAuto>

{/* Add custom patterns: */}
<RedactAuto customPatterns={[/ORDER-\d{6}/g]}>
  <div>Order: ORDER-123456</div>
</RedactAuto>

{/* Change the wrapper element (default "div") so it doesn't break flex/grid layouts: */}
<RedactAuto as="span">
  <span>Inline PII in a flex row: user@company.com</span>
</RedactAuto>
```

**Built-in patterns:** `email` · `phone` · `ssn` · `credit-card` (Luhn-validated) · `ip`

`<RedactAuto>` wraps its children in an element (`as`, default `"div"`) so it can scan and mutate the subtree — pass `as="span"` or another tag when the default `div` would break a flex/grid layout.

## API at a Glance

| Export | Type | Description |
|--------|------|-------------|
| `<RedactProvider>` | Component | Context provider — wraps your app, configures mode/shortcut/blurRadius/maskChar |
| `<Redact>` | Component | Wraps known PII for manual redaction |
| `<RedactAuto>` | Component | Scans a subtree and auto-wraps detected PII |
| `useRedactMode()` | Hook | Returns `{ isRedacted, mode, enable, disable, toggle }` |
| `useRedactPatterns()` | Hook | Read active patterns and add custom ones |
| `getInitialRedactEnabled()` | Utility | Read `?redact=true` from URL for initial state |

### Controlled vs. uncontrolled `enabled`

By default `<RedactProvider>` is **uncontrolled** — it owns its own `enabled` state, flipped by the
keyboard shortcut or `useRedactMode()`. To fully control it from your own state (e.g. to persist the
preference), pass both `enabled` and `onEnabledChange`, mirroring a controlled `<input>`:

```tsx
function App() {
  const [redacted, setRedacted] = useState(false);
  return (
    <RedactProvider enabled={redacted} onEnabledChange={setRedacted}>
      <Dashboard />
    </RedactProvider>
  );
}
```

`onEnabledChange` fires for every internally-driven change (keyboard shortcut, `useRedactMode()`);
it is not called when `enabled` changes purely because you updated the prop yourself.

## Security model

**react-redact only changes what's rendered on screen. It is not encryption, access control, or
data removal, and it should never be the only thing standing between a viewer and real PII.**

What actually happens under the hood, mode by mode:

- **Blur** — the real text is rendered into the DOM exactly as given, with `filter: blur(...)`
  and `user-select: none` layered on as styling. Disable the filter (dev tools, "View Source",
  reader mode, a screenshot tool that renders past CSS filters) and the original value is right
  there as a text node.
- **Mask** — `<Redact mode="mask">` renders only the bullet string; the real value isn't written
  into that component's output DOM. However, **`<RedactAuto>` always stores the original matched
  text in a `data-redact-original` attribute on the wrapping span, regardless of mode** — including
  mask and replace — specifically so it can restore the page when redaction is toggled off. That
  attribute is plain, uninspected DOM content: `document.querySelectorAll('[data-redact-original]')`
  recovers every auto-detected value even while masked.
- **Replace** — same caveat as mask: manual `<Redact mode="replace">` doesn't emit the real value,
  but `<RedactAuto>`'s replace mode still writes it to `data-redact-original`.
- **Custom** — entirely up to your `renderRedacted`/`customRender` function; react-redact doesn't
  enforce anything about what it outputs.

Practical implications:

- Don't rely on this for anything you wouldn't be comfortable also putting in a public HTML
  comment. Real secrets (API keys, tokens, passwords) belong in a secrets manager, not behind
  `<Redact>`.
- `aria-hidden="true"` hides redacted spans from assistive tech, but a misconfigured or
  non-compliant screen reader could still announce the content — it's a convention, not a
  guarantee.
- Screen recording/screenshare tools that capture the DOM (rather than a pixel-accurate screen
  grab) can bypass CSS-based hiding entirely.
- This library is aimed at demos, screenshares, and presentations where the audience isn't
  actively trying to extract the underlying data — not at protecting data from the person
  looking at the screen.

## Documentation

Full docs, API reference, and interactive demos:

- **Local:** `pnpm --filter react-redact-docs dev` → [localhost:3001](http://localhost:3001)
- **Content:** [`apps/docs/content/docs`](./apps/docs/content/docs)
- **Changelog:** [`CHANGELOG.md`](./CHANGELOG.md)

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
git clone https://github.com/btahir/react-redact.git
cd react-redact
pnpm install
pnpm run build
pnpm test:run
```

## License

[MIT](./LICENSE)
