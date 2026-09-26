# Architecture and contracts

This source checkout is version 0.4.0. It is not evidence that npm or the production site has been updated.

## Three layers

1. `react-redact` preserves the small visual toolkit. `Redact` replaces or blurs explicitly wrapped children. `RedactAuto` scans rendered text nodes and observes later mutations. Automatic scanning is post-render in **every** mode, including the compatibility name `secure`: it cannot prevent raw SSR HTML, initial exposure, React props, network responses or browser memory. Original text for restoration stays in a WeakMap rather than DOM attributes. Custom patterns share provider registration; zero-length matches stop that pattern scan. Arbitrary consumer regexes can still be computationally expensive.
2. `react-redact/data` is a pure deterministic policy and synthetic-data module. It imports neither React nor DOM APIs. Version-1 documents explicitly enumerate fields, their kinds and sample/mask/hide behavior. `createDemoRecord` accepts no source record; unknown policy properties are rejected. Stable demo-only entity IDs correlate name/email/company across routes and repeated fields. Reserved email, phone and IP ranges are used. Synthetic names and companies can coincidentally resemble real entities; samples are not guaranteed unique and are not anonymization.
3. `react-redact/fields` renders registered fields from that policy. A missing rule fails closed with a generic label. Within DemoProvider, original children are not rendered, including SSR. Prefer generating data upstream without passing real originals at all: hiding a child does not erase it from props, React Server Component payloads, memory or requests. `react-redact/studio` is an optional authoring client; `react-redact/diagnostics` is a DOM inspection module without React imports.

## Document and generator stability

The checked-in JSON Schema and runtime validator define version 1. Runtime validation additionally rejects duplicate/dangerous IDs, invalid calendar dates and unknown keys. Imports are bounded to 256 KB and 200 fields. Validation messages do not echo source values. Version 1 couples the document format and generation algorithm: maintain output stability within version 1; intentional generator changes require an explicit version and migration policy. Pin the package version for reproducible screenshot baselines. IDs and seeds should be invented identifiers, never real emails or customer IDs.

The reference date is explicit, generation is synchronous, and no random clock, network or global mutable state participates. Dates clamp at year 9999. Adding an unrelated field leaves established entity identities unchanged. Values authored into `replacement`, labels, seeds or names are exported by design: the schema cannot determine whether an author typed a real secret.

## Studio and registration

The Studio is controlled by a document/onChange pair, with local draft validation and a capped 50-entry undo/redo history. Invalid edits leave the last valid application policy active and block export. Field picking only selects registered `data-redact-field` elements inside the supplied root; it never copies their text. Highlights follow inserted targets and are cleaned up on unmount.

Local persistence is opt-in through storageKey. Existing drafts are offered for explicit restoration before autosave begins. Clear keeps the saved draft removed until the next author edit; storage failures are visible. Exports contain only validated policy JSON, never page snapshots or captured originals. There is no server, account, upload, analytics or paid feature in the editor.

A persistent Next layout hosts the demo workspace so route changes keep policy/history. Overview, customer directory and invoices share stable entity keys. Modal and asynchronous sample data use the same generator; the API has no customer database. The Vite consumer is an independent, runnable example. Storybook/MSW documentation is a recipe, not a claim of separately verified applications.

## Bounded readiness

A declared required field must be present and every present occurrence must have `data-redact-status="covered"`. Optional absent fields are allowed; optional present but unprepared fields fail. Unknown registered fields fail. Browser helpers and DOM diagnostics follow this same contract. This metadata is an integration check, not proof that values are safe.

Preflight lists common unsupported surfaces and heuristic unregistered text candidates. It does not comprehensively inspect form values, canvas/image pixels, CSS-generated text, shadow DOM, cross-origin frames, browser UI, network, storage or application memory. Sentinel checks inspect specified strings in current text, attributes and common control values; indices identify matches without repeating sentinel text. They cannot prove absence of all private data. Run route/modal/async cases intentionally. Studio invalidates a result after observed preview mutations; input properties and unobserved external surfaces still require review.

## Packaging and releases

The core never imports Studio. Five dual ESM/CommonJS bundles allow optional tooling to stay outside runtime consumers. React entries (index, fields, studio) receive `use client` after building; data and diagnostics remain server-callable. Both CSS exports are side effects. The Playwright helper has ESM and CommonJS entry points and structural types, requiring no Playwright runtime dependency of its own. The local CLI imports only built data code.

The minor Changeset has been applied for version 0.4.0, with dependency release notes for the private docs and Vite consumers; no publish or deployment occurs here. `enabled` is controlled when supplied; `defaultEnabled` preserves an uncontrolled initial setting. This migration is documented. All features remain MIT. Shared maintainer support is voluntary and uses the existing Tourlight support page; React Maintainer Support offers shared one-time and recurring contributions. No automated GitHub workflow is added.
