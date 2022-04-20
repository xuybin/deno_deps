import { denoPlugin, esbuild, esbuildTypes, wasmURL } from "./esbuild.ts";

let esbuildInitalized: boolean | Promise<void> = false;
async function ensureEsbuildInialized() {
  if (esbuildInitalized === false) {
    if (Deno.run === undefined) {
      esbuildInitalized = esbuild.initialize({
        wasmURL,
        worker: false,
      });
    } else {
      esbuild.initialize({});
    }
    await esbuildInitalized;
    esbuildInitalized = true;
  } else if (esbuildInitalized instanceof Promise) {
    await esbuildInitalized;
  }
}

class Bundle {
  async build(input: Record<string, URL> | esbuildTypes.StdinOptions) {
    let stdin: esbuildTypes.StdinOptions | undefined = undefined;
    let entryPoints: Record<string, string> | undefined = undefined;
    if (input.contents) {
      stdin = input as esbuildTypes.StdinOptions;
    } else {
      // deno-lint-ignore no-explicit-any
      const input2 = input as Record<string, any>;
      for (const key in input2) {
        input2[key] = (input as Record<string, URL>)[key].href;
      }
      entryPoints = input2;
    }

    const absWorkingDir = Deno.cwd();
    await ensureEsbuildInialized();
    const buildResult = await esbuild.build({
      bundle: true,
      entryPoints,
      stdin,
      format: "esm",
      metafile: true,
      minify: true,
      outdir: ".",
      // This is requried to ensure the format of the outputFiles path is the same
      // between windows and linux
      absWorkingDir,
      outfile: "",
      platform: "neutral",
      plugins: [denoPlugin()],
      splitting: true,
      target: ["chrome96", "firefox95", "safari14"],
      treeShaking: true,
      write: false,
    });
    return buildResult;
  }
}

export { Bundle };

export type { esbuildTypes };
