# react-redact

> One keyboard shortcut to make your entire app demo-safe.

`react-redact` is a zero-dependency React component library that visually hides PII in your UI — toggled by a single keyboard shortcut, hook, or URL param.

**Visual-only:** This is a UI convenience tool for demos and screenshares. It does not remove data from the DOM.

## Install

```bash
pnpm add react-redact
```

## Quick start

```tsx
import { RedactProvider, Redact, useRedactMode } from "react-redact";
import "react-redact/styles.css";

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
      <Redact>user@company.com</Redact>
    </>
  );
}
```

Press **⌘⇧X** (Mac) or **Ctrl+Shift+X** (Windows/Linux) to toggle redaction.

## License

MIT
