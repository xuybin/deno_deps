import * as esbuildWasm from "https://deno.land/x/esbuild_deno@v0.0.1/wasm/browser.js";
import * as esbuildNative from "https://deno.land/x/esbuild_deno@v0.0.1/native/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno@v0.0.1/mod.ts";

// @ts-ignore trust me
const esbuild: typeof esbuildWasm = Deno.run === undefined
  ? esbuildWasm
  : esbuildNative;

export { denoPlugin, esbuild };
