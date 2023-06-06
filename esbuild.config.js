import { build } from 'esbuild';

build({
  entryPoints: ["src/index.ts"],
  outfile: "./lib/index.js",
  bundle: true,
  charset: "utf8",
  format: "esm",
});