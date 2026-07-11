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

> **⚠️ Visual-only — not a security boundary.** In `blur`/`mask`/`replace` modes, react-redact hides
> PII on screen without removing it from the page — the real value is still sitting in the DOM
> (and, for `<RedactAuto>`, in a `data-redact-original` attribute) and can be read via "View
> Source", browser dev tools, the accessibility tree, or a few lines of JS. `mode="secure"` closes
> that specific hole (see [Modes](#modes) / [Security model](#security-model)) — but no mode is a
> substitute for real server-side redaction, and none of them protect data from a technically
> curious viewer with access to your app's own state or network traffic.

> **Blur works with zero CSS.** `mode="blur"` applies `filter: blur(...)` as an inline style, so it's visually safe even if you forget to import `react-redact/styles.css`. The stylesheet is entirely optional — import it only if you want the `react-redact-blur` class override hook or the opt-in `.react-redact-section` `content-visibility` helper.

<div align="center">
  <img src="https://raw.githubusercontent.com/btahir/react-redact/main/apps/docs/public/ph-1.png" alt="Before and after redaction" width="700" />
</div>

## Why react-redact?

You're about to share your screen. Your app is full of real customer data — emails, phone numbers, credit cards. You need to hide it **now**, not refactor your entire data layer.

**react-redact** solves this in one line: wrap your app in `<RedactProvider>`, press `⌘⇧X`, and every marked piece of PII is instantly blurred, masked, or replaced with fake data. No backend changes. No environment switching. Just a keyboard shortcut.

## Features

- **Instant toggle** — Keyboard shortcut (`⌘⇧X` / `Ctrl+Shift+X`), `useRedactMode()` hook, or `?redact=true` URL param
- **Auto-redact on screen share** — opt in to `autoRedactOnScreenShare` and react-redact flips on the moment an in-app screen recording starts, and restores your prior state when it stops
- **Four modes** — Blur, mask (bullets), replace with deterministic fake data, or secure (DOM-clean — see [Security model](#security-model))
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

### Auto-redact on screen share

Opt in with `autoRedactOnScreenShare` and react-redact wraps `navigator.mediaDevices.getDisplayMedia`
for you: the moment a capture starts, redaction flips on; the moment it ends, redaction goes back
to whatever it was before (so if you'd already turned it on manually, it stays on).

```tsx
<RedactProvider autoRedactOnScreenShare>
  <App />
</RedactProvider>
```

- Handles multiple concurrent captures (only restores once the *last* one ends), a cancelled
  share picker (rejected promise — nothing toggles), and cleans up after itself on unmount.
- Fires `onEnabledChange` exactly like the keyboard shortcut or `useRedactMode()` would.
- `useRedactMode()` exposes `isScreenSharing` if you want to show your own "recording" indicator.

> **⚠️ Read this before you rely on it for a demo.** This only detects captures *this page*
> starts via `getDisplayMedia` — e.g. an in-app "record a demo" button, or an embedded recording
> SDK like Loom's browser widget. It has **no way to see** OS-level or other-application screen
> shares: picking your app's window/tab from Zoom's, Google Meet's, or your OS's own screen-share
> picker happens entirely outside the browser tab and is invisible to any web page. For those,
> the keyboard shortcut (`⌘⇧X`) remains your primary safety net — treat auto-redact-on-share as a
> bonus for the in-app-recorder case, not a replacement for it.

## Modes

<div align="center">
  <img src="https://raw.githubusercontent.com/btahir/react-redact/main/apps/docs/public/ph-2.png" alt="Three redaction modes — blur, mask, replace" width="700" />
</div>

| Mode | What it does | Example output |
|------|-------------|----------------|
| **Blur** | Inline `filter: blur(...)` over original text (no CSS import required) | ░░░░░░░░░░░ |
| **Mask** | Replaces each character with a repeated mask character | `•••••••••••` |
| **Replace** | Deterministic fake data (same input → same output) | `jane.doe@example.com` |
| **Secure** | Like replace, but guarantees the real value is never written to the DOM at all — see [Security model](#security-model) | `jane.doe@example.com` |

```tsx
<RedactProvider mode="blur">   {/* default */}
<RedactProvider mode="mask">
<RedactProvider mode="replace">
<RedactProvider mode="secure">

{/* Or per-component: */}
<Redact mode="replace">user@company.com</Redact>
<Redact mode="secure">user@company.com</Redact>
```

### Secure mode

`mode="secure"` renders like `mode="replace"` (fake data when a pattern is recognized, otherwise
the mask character) but with a stronger guarantee: **the real value never touches the DOM while
redaction is enabled** — not as a text node, not as a `data-redact-original` attribute, nothing a
"View Source", devtools Elements-panel inspection, DOM-scraping copy, or OCR-of-the-DOM pass can
recover. `<RedactAuto>` keeps the original around only in an in-memory `WeakMap` (not the DOM) so
it can restore it once you disable redaction.

```tsx
<RedactProvider mode="secure">
  <RedactAuto patterns={['email', 'phone']}>
    <CustomerDetails />
  </RedactAuto>
</RedactProvider>

<Redact mode="secure">user@company.com</Redact>
```

Use `secure` instead of `blur`/`mask`/`replace` whenever the audience might poke at devtools —
e.g. a public conference demo, a recorded walkthrough that gets uploaded somewhere, or any
screenshare where you can't fully vouch for who's watching. See
[Security model](#security-model) for exactly what is and isn't covered.

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
| `<RedactProvider>` | Component | Context provider — wraps your app, configures mode/shortcut/blurRadius/maskChar/autoRedactOnScreenShare |
| `<Redact>` | Component | Wraps known PII for manual redaction |
| `<RedactAuto>` | Component | Scans a subtree and auto-wraps detected PII |
| `useRedactMode()` | Hook | Returns `{ isRedacted, mode, enable, disable, toggle, isScreenSharing }` |
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
- **Secure** — closes exactly that hole. Whether you're using `<Redact mode="secure">` or
  `<RedactAuto>` under `<RedactProvider mode="secure">`, the real value is never written to the DOM
  in any form — no text node, no `data-redact-original`, nothing `document.querySelectorAll` or a
  DOM-scraping copy/OCR pass can find. The only place it lives while redacted is a JS-side
  `WeakMap` (for `<RedactAuto>`'s restore-on-disable) or the component's own `children` prop (for
  `<Redact>`), neither of which touches serialized/rendered HTML.
- **Custom** — entirely up to your `renderRedacted`/`customRender` function; react-redact doesn't
  enforce anything about what it outputs.

Even with `mode="secure"`, these are **not** covered — no mode changes this:

| Caveat | Why it's still true in secure mode |
|--------|-------------------------------------|
| Data already in the DOM before you enabled redaction | Secure mode only governs what it renders once it's on; toggling on doesn't retroactively scrub content that was visible before |
| React state, props, and closures | The real value still lives in memory wherever your app already put it (a query result, a store, etc.) — secure mode hides the *rendered output*, not your app's data model |
| Network responses | If your API returns the real PII to the client (even if react-redact hides it visually), a network tab / response inspector still sees it |
| A user screen-recording the pixels themselves | No DOM-based mode can stop someone recording their own screen and reading it back frame-by-frame |
| `<Redact>`'s `children` prop, while mounted | React itself still holds the real value as a prop during that render — it's just never serialized into `innerHTML`/`outerHTML` |

Practical implications:

- Don't rely on this for anything you wouldn't be comfortable also putting in a public HTML
  comment. Real secrets (API keys, tokens, passwords) belong in a secrets manager, not behind
  `<Redact>`.
- `aria-hidden="true"` hides redacted spans from assistive tech, but a misconfigured or
  non-compliant screen reader could still announce the content — it's a convention, not a
  guarantee.
- Screen recording/screenshare tools that capture the DOM (rather than a pixel-accurate screen
  grab) can bypass CSS-based hiding entirely for blur/mask/replace — this is precisely the gap
  `mode="secure"` closes.
- `autoRedactOnScreenShare` only sees captures your own page starts via `getDisplayMedia` — it
  cannot detect or react to OS-level/other-app screen shares. See
  [Auto-redact on screen share](#auto-redact-on-screen-share) for the full limitation.
- This library is aimed at demos, screenshares, and presentations where the audience isn't
  actively trying to extract the underlying data — not at protecting data from the person
  looking at the screen. `mode="secure"` raises the bar (a casual devtools poke won't work) but
  is still not a substitute for server-side redaction of anything genuinely sensitive.

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
