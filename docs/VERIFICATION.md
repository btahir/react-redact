# Verification evidence

Checked locally on 2026-09-25, macOS, Node 24, pnpm 11.1.1; library Node engine is >=18. These results verify this source branch, not publication, deployment, SEO indexing, demand or a universal privacy guarantee.

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm validate
pnpm size
pnpm --filter react-redact-docs build
pnpm --filter react-redact-vite build
pnpm test:package
# In one terminal (build library first):
pnpm --filter react-redact-docs exec next dev --port 4313
# In another:
pnpm test:e2e --workers=3
```

Install the Playwright browser engines once with `pnpm exec playwright install chromium firefox webkit`. The browser config defaults to localhost:4313, configurable with REDACT_TEST_URL. To build docs while the development preview remains running, set `REDACT_BUILD_DIR=.next-production` for the docs build; do not share one Next output directory between them.

## Evidence and scope

- Unit/runtime suite: 175 tests across 25 files, including deterministic schema/generator boundaries, SSR replacement, explicit legacy automatic SSR exposure, provider registration/controlled state, zero-length Unicode regexes, no original DOM attributes, async mutations, draft restoration/clear and watcher disposal.
- Playwright: seven complete flows in Chromium, Firefox and WebKit (21 cases): route identity and undo persistence, modal interaction, reload/restore/clear, import/export and invalid imports, field picking, async sample endpoint, preflight metadata rejection, stale-result invalidation, and 390-pixel mobile layout. No application console error in the main navigation flow. Real browser accessible names/focus behaviors are exercised; this is not a comprehensive accessibility audit.
- Packed consumer: `scripts/test-package.mjs` creates a tarball and installs it into a disposable independent npm project. It verifies shipped README/schema/skill/CSS, client directives and pure server modules, ESM/CommonJS/helper imports, server-rendered sentinel exclusion, CLI generation/validation/overwrite refusal, and an actual Next App Router production build with server-side data imports plus client-side Studio/CSS. Temporary files are removed in finally. Package tests do not just alias monorepo source.
- Package correctness: publint passes; AreTheTypesWrong checks every JavaScript/JSON export under Node16 and bundler resolution. CSS entrypoints are excluded from JavaScript type-resolution checks and exercised in the real Next and Vite builds. Legacy Node10 resolution is outside the supported export-map contract.
- Core size: 4.62 kB minified and Brotli-compressed with the existing 5 kB size-limit budget. This is the root runtime entry, not the full optional Studio/React application.
- Docs production build: 30 static/dynamic routes, including the generated social image, canonical documentation routes, llms endpoints, schema, sitemap and synthetic API. Independent Vite production build passes.
- Local HTTP discovery probe: home, docs, Studio, robots, sitemap, both llms endpoints and schema return 200; home/docs/Studio have production-host canonicals and branded titles. The new social image returns PNG and was visually inspected. This does not establish production deployment or search indexing.
- Manual local browser review: desktop and 390px mobile homepage/Studio, actual generated identities, modal Escape/focus return, draft recovery and no horizontal overflow. Root review caught and prompted fixes for route resets, hardcoded initials and stale coverage reports.

## Deliberate limits

Automatic text scanning is post-render, not a security control. Even a passing bounded preflight or sentinel probe does not certify absence of PII. Real data must be kept out of demo inputs, responses and serialized props upstream. CSS blur is cosmetic; metadata can be incorrectly supplied by application code. Browser screenshots cannot verify network/cache/heap absence. SSR tests check the rendered subtree, not all possible surrounding app payloads.

The package peer range permits React 18+, but this run uses React 19 and Next 15.5; no claim is made that every React/browser/Node version has been exercised. Arbitrary custom regexes still require consumer review for runtime cost. Canvas, cross-origin frames, images, shadow roots, CSS content and uncontrolled inputs need separate handling. Same-tab getDisplayMedia observation does not detect external Zoom/Meet/OS sharing. No tests initiate a real screen capture or checkout/payment.

Next/Vite applications are runnable and verified. Storybook and MSW integrations are documented sample code, not separately built projects in this branch. Funding links are existing shared support links; no checkout/payment was initiated by these tests, and publication and deployment remain separate actions.

## Prepared 0.4.0 release

Applied the minor Changeset with normal dependency version updates: react-redact 0.4.0, private docs 0.1.3, and private Vite example 0.0.1. The existing GitHub changelog adapter could not resolve the unpushed commit, so the version command used the standard local Changesets changelog adapter temporarily; the repository configuration was restored unchanged. Release notes were consolidated and the consumed Changeset removed. A frozen-lockfile install confirms workspace links remain consistent (no lockfile content change was necessary). The built 0.4.0 tarball passed package/export checks and the complete isolated packed consumer, now asserting tarball and installed manifest versions match the source manifest. The npm registry version list still ended at 0.3.0 when checked; 0.4.0 was not published by this work.
