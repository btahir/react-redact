// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "modes.mdx": () => import("../content/docs/modes.mdx?collection=docs"), "patterns.mdx": () => import("../content/docs/patterns.mdx?collection=docs"), "recipes.mdx": () => import("../content/docs/recipes.mdx?collection=docs"), "components/provider.mdx": () => import("../content/docs/components/provider.mdx?collection=docs"), "components/redact-auto.mdx": () => import("../content/docs/components/redact-auto.mdx?collection=docs"), "components/redact.mdx": () => import("../content/docs/components/redact.mdx?collection=docs"), "hooks/use-redact-mode.mdx": () => import("../content/docs/hooks/use-redact-mode.mdx?collection=docs"), "hooks/use-redact-patterns.mdx": () => import("../content/docs/hooks/use-redact-patterns.mdx?collection=docs"), }),
};
export default browserCollections;