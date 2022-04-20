import { esbuildTypes } from "./bundle.ts";
import { HandlerContext, MatchHandler } from "./router.ts";
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
  code: string;
  parentElementId: string;
  removeChildNodes?: boolean;
};

export const defaultImport =
  'import {  h, hydrate,Component,Fragment} from "https://crux.land/bin@nano_jsx.ts";';
export function makeCode(
  inputs: HydrateComponent[],
  importStr = defaultImport,
) {
  return `/** @jsx h */
${importStr}
${
    inputs.map((input) => {
      return input.code +
        `\nhydrate(<${/\s*class\s+(\S+)\s+extends\s+Component\s+/.exec(
          input.code,
        )?.[1]} />, document.getElementById("${input.parentElementId}"),${
          input.removeChildNodes == undefined ? true : input.removeChildNodes
        });`;
    }).join("\n")
  }`;
}

export function makeRoute(
  path: string,
  inputs: HydrateComponent[],
  importStr = defaultImport,
) {
  const result: Record<string, MatchHandler<Context>> = {};
  result[path] = async (
    req: Request,
    ctx: HandlerContext<Context>,
    _match: Record<string, string>,
  ) => {
    const pathname = new URL(req.url).pathname;
    let res: Response | undefined;
    const headers = new Headers({
      "content-type": "application/javascript; charset=UTF-8",
    });
    const file = ctx.bundle.get(pathname);
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
  };
  return result;
}
