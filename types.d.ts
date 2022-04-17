// deno-lint-ignore-file no-explicit-any no-var
interface AbortSignal extends EventTarget {
  readonly reason?: unknown;
  throwIfAborted(): void;
}

// @ts-ignore like https://github.com/denoland/deno/issues/12558
declare var AbortSignal: {
  prototype: AbortSignal;
  new (): AbortSignal;
  abort(reason?: any): AbortSignal;
  timeout(milliseconds: number): AbortSignal;
};
