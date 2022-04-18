// @deno-types="https://deno.land/x/esbuild_deno@v0.0.2/native/mod.d.ts"
import * as esbuildWasm from "https://deno.land/x/esbuild_deno@v0.0.2/wasm/browser.js";
import * as esbuildNative from "https://deno.land/x/esbuild_deno@v0.0.2/native/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno@v0.0.2/mod.ts";
const wasmURL = "https://deno.land/x/esbuild_deno@v0.0.2/wasm/esbuild.wasm";
// @ts-ignore trust me
const esbuild: typeof esbuildWasm = Deno.run === undefined
  ? esbuildWasm
  : esbuildNative;

export { denoPlugin, esbuild, esbuildWasm as esbuildTypes, wasmURL };
