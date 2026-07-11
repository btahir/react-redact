# react-redact

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
