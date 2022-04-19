/// <reference lib="dom" />
import { Component } from "./nano_jsx.ts";
import { esbuildTypes } from "./bundle.ts";
import { HandlerContext } from "./router.ts";
import { basename } from "./std.ts";

export type Context = {
  bundle: {
    build: (
      input: Record<string, URL> | esbuildTypes.StdinOptions,
    ) => Promise<
      esbuildTypes.BuildResult & { outputFiles: esbuildTypes.OutputFile[] }
    >;
    get(key: string): Uint8Array | undefined;
    set(key: string, value: Uint8Array): void;
  };
};
export type HydrateComponent = {
  component: Component;
  parentElementId: string;
  removeChildNodes?: boolean;
};

export const defaultImport =
  'import {  h, hydrate,Component,Fragment} from "https://crux.land/bin@nano_jsx";';
export function makeCode(
  inputs: HydrateComponent[],
  importStr = defaultImport,
) {
  return `/** @jsx h */
${importStr}
${
    inputs.map((input) => {
      //export class Counter extends Component\n
      const code = input.component + "\n";
      return code +
        `hydrate(<${/\s*export\s+class\s+(\S+)\s+extends\s+Component\s+/.exec(
          code,
        )?.[1]} />, document.getElementById("${input.parentElementId}"),${
          input.removeChildNodes == undefined ? true : input.removeChildNodes
        });`;
    }).join("\n")
  }`;
}
export function makeRoutes(
  path: string,
  inputs: HydrateComponent[],
  importStr = defaultImport,
) {
  return {
    path: async (
      req: Request,
      ctx: HandlerContext<Context>,
      match: Record<string, string>,
    ) => {
      const pathname = new URL(req.url).pathname;
      let res: Response | undefined;
      const headers = new Headers({
        "content-type": "application/javascript",
      });

      const file = ctx.bundle.get(pathname);
      console.log("file:=" + file?.length);
      if (file) {
        res = new Response(file, {
          status: 200,
          headers,
        });
      } else {
        const buildResult = await ctx.bundle.build({
          contents: makeCode(inputs, importStr),
          resolveDir: Deno.cwd(),
          sourcefile: `${basename(path.replaceAll(":", ""))}.jsx`,
          loader: "jsx",
        });
        console.log("outputFiles.length=" + buildResult.outputFiles.length);
        if (buildResult.outputFiles.length > 0) {
          ctx.bundle.set(
            pathname,
            buildResult.outputFiles[0].contents,
          );
          res = new Response(ctx.bundle.get(pathname), {
            status: 200,
            headers,
          });
        }
      }

      return res ?? new Response(null, {
        status: 404,
      });
    },
  };
}
