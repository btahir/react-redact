# react-redact

## 0.3.0

### Minor Changes

- [`d8d7a87`](https://github.com/btahir/react-redact/commit/d8d7a8763f6319d0511991c3e692f7c4a3cd0035) Thanks [@btahir](https://github.com/btahir)! - Add auto-redact on screen share and a DOM-clean `secure` redaction mode.

  - **`autoRedactOnScreenShare` (RedactProvider prop):** opt-in flag that wraps
    `navigator.mediaDevices.getDisplayMedia` at mount. Starting a same-tab screen/window/tab capture
    automatically enables redaction; ending the last active capture restores whatever `enabled`
    state was in effect right before it started (so a manual enable before sharing stays on). Only
    detects captures the page itself initiates via `getDisplayMedia` (e.g. an in-app demo recorder
    or an embedded recording SDK) — it cannot see OS-level or other-application screen shares
    (Zoom/Meet/OS picker), so the keyboard shortcut remains the recommended primary toggle for
    those. Fires `onEnabledChange` like any other internally-driven toggle, restores the original
    `getDisplayMedia` on unmount, and handles multiple concurrent streams and a cancelled share
    picker correctly. `useRedactMode()` now also returns `isScreenSharing`.
  - **`mode="secure"` (for `<Redact>` and `<RedactAuto>`):** a new redaction mode that guarantees the
    real value is never written to the DOM at all while enabled — no text node, no
    `data-redact-original` attribute, nothing recoverable via devtools, "View Source", or a
    DOM-scraping copy/OCR pass. Displays deterministic fake data when a pattern is recognized
    (mirrors `mode="replace"`), otherwise the configurable mask character. `<RedactAuto>` keeps the
    original text only in an in-memory `WeakMap` for restoration on disable, including through the
    `MutationObserver` rescan path.
  - Updated README (new "Auto-redact on screen share" section, expanded "Security model" with a
    secure-mode threat table) and docs (`RedactProvider`, `Redact`, `RedactAuto`, `useRedactMode`,
    `Modes`, `Recipes`, `Getting Started`) to cover both features.

## 0.2.0

### Minor Changes

- Safety fixes and new APIs from a full audit:

  - Fix (safety): blur mode now applies `filter: blur()` as an inline style, so redaction works even without importing `styles.css`
  - Fix: removed the provider's imperative force-blur that incorrectly blurred mask/replace/custom spans
  - Fix: `RedactAuto` no longer tears down and re-scans on every parent re-render (stable pattern keys)
  - Fix: credit-card pattern rewritten to avoid catastrophic backtracking (ReDoS)
  - Fix: phone pattern no longer matches arbitrary 10-digit runs embedded in longer numbers
  - New: `onEnabledChange` callback on `RedactProvider`
  - New: `blurRadius` and `maskChar` configurable on provider and components
  - New: `useRedactMode()` now exposes the current `mode`
  - New: `RedactAuto` accepts an `as` prop to control its wrapper element
  - Dev-only warning when mask/replace receive non-string children
