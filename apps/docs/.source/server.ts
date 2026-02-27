// @ts-nocheck
import * as __fd_glob_9 from "../content/docs/hooks/use-redact-patterns.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/hooks/use-redact-mode.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/components/redact.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/components/redact-auto.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/components/provider.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/recipes.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/patterns.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/modes.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"index.mdx": __fd_glob_1, "modes.mdx": __fd_glob_2, "patterns.mdx": __fd_glob_3, "recipes.mdx": __fd_glob_4, "components/provider.mdx": __fd_glob_5, "components/redact-auto.mdx": __fd_glob_6, "components/redact.mdx": __fd_glob_7, "hooks/use-redact-mode.mdx": __fd_glob_8, "hooks/use-redact-patterns.mdx": __fd_glob_9, });