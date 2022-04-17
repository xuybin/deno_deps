import type {
  CSSRules,
  Plugin,
  ThemeSection,
} from "https://esm.sh/twind@0.16.16";
interface Options {
  className?: string;
}
// @ts-ignore module 'twind' cannot be found
declare module "twind" {
  interface Theme {
    typography?: ThemeSection<{
      css?: CSSRules;
    }>;
  }
}
declare const typography: ({ className }?: Options) => Record<string, Plugin>;

export default typography;
export type { Options };
