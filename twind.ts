import { setup } from "https://esm.sh/twind@0.16.16";
import {
  Configuration,
  getStyleTag,
  shim,
  TW,
  VirtualSheet,
  virtualSheet,
} from "https://esm.sh/twind@0.16.16/shim/server";

// @deno-types="./typography.d.ts"
import typography from "https://esm.sh/@twind/typography@0.0.2";

export { getStyleTag, setup, shim, typography, virtualSheet };
export type { Configuration, TW, VirtualSheet };
