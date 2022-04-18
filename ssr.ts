/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

export * from "./nano_jsx.ts";

import { Helmet, renderSSR as nanoRender } from "./nano_jsx.ts";

import {
  Configuration,
  getStyleTag,
  setup,
  shim,
  TW,
  typography,
  VirtualSheet,
  virtualSheet,
} from "./twind.ts";

let SHEET_SINGLETON: VirtualSheet | null = null;
function createSheet(twOptions = {}) {
  return SHEET_SINGLETON ??= setupSheet(twOptions);
}

// Setup TW sheet singleton
function setupSheet(twOptions: Configuration) {
  const sheet = virtualSheet();
  setup({ ...twOptions, sheet, plugins: { ...typography() } });
  return sheet;
}

// deno-lint-ignore no-explicit-any
const html = ({ body, head, footer, styleTag }: any) => (`
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    ${head}
    ${styleTag}
  </head>
  <body>
    ${body}
    ${footer.join("\n")}
  </body>
<html>
`);

export interface SSRSettings {
  pathname?: string;
  clearState?: boolean;
  tw?: TW;
}

export function ssr(render: CallableFunction, options?: SSRSettings) {
  const sheet = createSheet(options?.tw ?? {});
  sheet.reset();
  const app = nanoRender(render(), options);
  shim(app, { tw: options?.tw });
  const { body, head, footer } = Helmet.SSR(app);
  const styleTag = getStyleTag(sheet);
  return new Response(
    html({ body, head, footer, styleTag }),
    {
      headers: {
        "content-type": "text/html; charset=UTF-8",
      },
    },
  );
}

export function memoizedSSR(render: CallableFunction, options?: SSRSettings) {
  let mresp: Response | null = null;
  return () => {
    const resp = mresp ?? (mresp = ssr(render, options));
    return resp.clone();
  };
}
