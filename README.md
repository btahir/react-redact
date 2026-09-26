# react-redact

**A better day to demo.** Consistent synthetic data, a visual field editor, and local checks for your React application. Free and MIT licensed.

[Live demo & Studio](https://react-redact.vercel.app) · [Documentation](https://react-redact.vercel.app/docs) · [Security boundaries](https://react-redact.vercel.app/docs/security) · [GitHub](https://github.com/btahir/react-redact)

> Scenario, Studio, and preflight APIs require react-redact 0.4.0 or later.

## Choose your workflow

| Need | Import | What it does |
| --- | --- | --- |
| Consistent demo records | `react-redact/data` | Pure seeded generation with explicit fields; works in Node and Server Components |
| React demo fields | `react-redact/fields` | Substitutes configured fields during rendering, including SSR |
| Visual authoring | `react-redact/studio` | Target picking, field editing, undo/redo, local drafts, validated JSON import/export |
| Local checks | `react-redact/diagnostics` | Bounded field coverage and synthetic-sentinel checks |
| Browser test helper | `react-redact/playwright` | Checks a supplied Playwright page; no browser dependency in the runtime |
| Quick visual hiding | `react-redact` | Provider, `Redact`, best-effort `RedactAuto`, keyboard shortcut, hooks |

## Install

```sh
npm install react-redact
```

React 18+ is a peer dependency. Studio is optional and does not enter the default runtime import. There is no account, hosted database, telemetry, or required paid feature.

## A synthetic-only demo

```tsx
import { createDemoDocument } from 'react-redact/data';
import { DemoProvider, DemoField } from 'react-redact/fields';

const document = createDemoDocument();

export function Customer() {
  return (
    <DemoProvider document={document}>
      <h2><DemoField id="customer.name" entity="demo-1" /></h2>
      <p><DemoField id="customer.email" entity="demo-1" /></p>
      <p><DemoField id="customer.company" entity="demo-1" /></p>
    </DemoProvider>
  );
}
```

The same seed and demo entity produce the same name, email, and company across views. No original customer record is needed. Missing field rules show an unconfigured placeholder instead of a supplied child. Without `DemoProvider`, `DemoField` displays its children normally.

For server-rendered tables, fixtures, or API mocks:

```ts
import { createDemoDocument, createDemoRecord } from 'react-redact/data';
const policy = createDemoDocument();
const customers = ['demo-1', 'demo-2'].map(id => createDemoRecord(policy, id));
```

Only declared keys are generated. Use demo-only entity IDs and seeds. These are deterministic samples, not encryption or irreversible anonymization. Authored replacements are included in exports; do not type private values into them.

## Add the optional editor

```tsx
'use client';
import { useRef, useState } from 'react';
import { createDemoDocument } from 'react-redact/data';
import { DemoProvider, DemoField } from 'react-redact/fields';
import { RedactStudio } from 'react-redact/studio';
import 'react-redact/studio.css';

export function Demo() {
  const [document, setDocument] = useState(createDemoDocument);
  const rootRef = useRef<HTMLDivElement>(null);
  return <>
    <div ref={rootRef}>
      <DemoProvider document={document}>
        <DemoField id="customer.name" />
        <DemoField id="customer.email" />
        <DemoField id="customer.company" />
      </DemoProvider>
    </div>
    <RedactStudio document={document} onChange={setDocument}
      rootRef={rootRef} storageKey="my-demo-policy-v1" />
  </>;
}
```

Studio edits the same versioned policy used by your application. It supports semantic target picking, required-field checks, sample/mask/hide rules, validation, 50 history entries, and JSON import/export. Draft storage is opt-in; saved work is restored explicitly rather than overriding server-rendered state. The editor never captures page text into exported documents.

## Local CLI and browser checks

```sh
npx --no-install redact init demo.json
npx --no-install redact validate demo.json
npx --no-install redact fixtures demo.json 3
```

`init` refuses to overwrite an existing file. The CLI performs no network requests. The schema ships at `react-redact/schema.json`; the agent instructions ship in `skills/react-redact/SKILL.md`.

```ts
import { checkDemoPage } from 'react-redact/playwright';
const report = await checkDemoPage(page, policy, {
  root: '[data-testid="demo-preview"]',
  sentinels: ['FAKE-PRIVATE-SENTINEL'],
});
expect(report.passed).toBe(true);
```

Use invented sentinels, never actual private values. Reports contain rule IDs/counts and sentinel indices. Coverage checks do not prove all private information is absent. Visit the routes and dialog states you intend to demonstrate. Clipboard contents, network traffic, media pixels, and unvisited pages are not checked by this helper.

## Existing visual toolkit

```tsx
import { RedactProvider, Redact, RedactAuto, useRedactMode } from 'react-redact';

<RedactProvider defaultEnabled mode="mask" shortcut="mod+shift+x">
  <Redact accessibleLabel="Email hidden for this demo">person@example.com</Redact>
  <RedactAuto patterns={['email', 'phone']}>{/* best-effort subtree scan */}</RedactAuto>
</RedactProvider>
```

`⌘⇧X` / `Ctrl+Shift+X` toggles an uncontrolled provider. `useRedactMode()` exposes `isRedacted`, `mode`, `enable`, `disable`, `toggle`, and `isScreenSharing`. Pass `enabled` with `onEnabledChange` for controlled state; use `defaultEnabled` for an initially active, internally toggled provider. A supplied `enabled` is authoritative, even if the parent declines an internal toggle request.

Modes: `blur`, `mask`, `replace`, `secure` (compatibility name), and `custom`. Blur uses an inline style; `react-redact/styles.css` is optional. `Redact` accepts `replacement`, `blurRadius`, `maskChar`, `accessibleLabel`, and `renderRedacted`. Provider `customRender` supplies the default custom renderer. Non-text children cannot be extracted safely; manual mask/replace use a placeholder.

`RedactAuto` supports an `as` wrapper, built-in `email`, `phone`, `ssn`, `credit-card` (Luhn), `ip`, and explicit custom regex. It inherits provider patterns unless overridden. `useRedactPatterns().addPattern(regex, name)` registers a provider-local custom pattern. Empty regex matches are unsupported and stop that pattern's scan. Keep custom patterns trusted and bounded; this is not a general untrusted-regex execution engine.

`getInitialRedactEnabled()` reads `?redact=true` or `?redact=1`; it returns false on the server. For stable SSR, resolve initial demo state in your own server logic. Opt-in `autoRedactOnScreenShare` sees only `getDisplayMedia` calls made by the same page; it cannot detect Zoom, another tab, or an OS screen share. Prepare your demo before sharing.

## Important boundaries

- **Blur** leaves original text in the DOM. CSS is not a security boundary.
- **Manual mask/replace/secure** render a replacement instead of their children while enabled. Original values can still exist in React props, application memory, network responses, or serialized Server Component data.
- **Automatic scanning** happens after rendering. Original text can be present in server HTML and between dynamic updates and scans. All restoration values are kept in memory; no mode writes a `data-redact-original` attribute. The name `secure` does not change the post-render boundary.
- Inputs, attributes, iframe/shadow-root content, and media are not comprehensively scanned. Regex detections miss information and can match harmless samples.
- **Demo fields** substitute during rendering. For public demos, generate synthetic inputs upstream and avoid fetching real records at all. Never pass real source data through an RSC/client boundary and assume a visual wrapper removes it.

## Examples and development

The [Next.js workspace](https://github.com/btahir/react-redact/tree/main/apps/docs) includes three routes, a customer dialog, a synthetic API endpoint, and the actual Studio. A [Vite example](https://github.com/btahir/react-redact/tree/main/examples/vite) shows standalone local use. The [recipes](https://react-redact.vercel.app/docs/recipes) cover MSW, Storybook, and screenshot workflows.

```sh
pnpm install
pnpm validate
pnpm --filter react-redact-docs build
pnpm --filter react-redact-docs dev
```

See [architecture](https://github.com/btahir/react-redact/blob/main/docs/ARCHITECTURE.md), [verification](https://github.com/btahir/react-redact/blob/main/docs/VERIFICATION.md), and [changelog](https://github.com/btahir/react-redact/blob/main/CHANGELOG.md).

## Shared maintenance

react-redact is maintained alongside react-tourlight, react-kino, and react-clickmap. Voluntary maintainer support funds fixes, compatibility, documentation, and new features across these tools. [Support this project](https://react-tourlight.vercel.app/support). Shared React Maintainer Support offers one-time and recurring contributions. Contributions are optional and support shared maintenance.

Every feature remains free under the [MIT license](https://github.com/btahir/react-redact/blob/main/LICENSE); no membership or paid entitlement is required.
