---
name: react-redact
description: Prepare a synthetic React demo using explicit versioned field rules, a local editor, and bounded preflight checks.
---

Read the installed package README and schema before making changes. Use `react-redact/data` in Node/server code, `react-redact/fields` for render-time React fields, and `react-redact/studio` only in opt-in authoring environments. Keep Studio out of the default runtime import.

1. Create a document with `createDemoDocument()` or `redact init demo.json`. Use demo-only seeds/entity IDs and a fixed reference date.
2. Declare semantic field IDs explicitly. `createDemoRecord` generates only declared fields and requires no original customer record.
3. Keep production data out of public demo routes and Server Component client payloads. Do not fetch a real record merely to hide it in a client wrapper.
4. Validate with `redact validate demo.json`; generate samples with `redact fixtures demo.json 3`.
5. Add `DemoProvider`/`DemoField`, then optional Studio using the same policy document. Fields missing a rule fail closed within the provider.
6. Run bounded local diagnostics/Playwright checks with invented sentinels. Visit each demonstrated page and dialog. Record unsupported surfaces and exact checks performed.

Never upload page text, real customer records, original-to-fake mapping tables, or private screenshots to a model/tool service by default. Exports contain explicitly authored labels and replacements: those can still contain private text if the author entered it. Review before sharing.

Automatic `RedactAuto` is post-render concealment: server HTML and dynamic text can contain originals. `secure` is a compatibility mode name, not a guarantee. Blur is CSS. No mode protects network traffic or application memory. Do not call a passed preflight a privacy certification.

Use existing local test scripts; do not create GitHub CI, publish npm, deploy, or change payment settings as part of preparing a demo.
