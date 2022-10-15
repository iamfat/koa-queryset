const { build } = require("esbuild");

build({
  entryPoints: ["src/index.ts"],
  outfile: "./lib/index.mjs",
  bundle: true,
  charset: "utf8",
  format: "esm",
});

build({
  entryPoints: ["src/index.ts"],
  outfile: "./lib/index.js",
  bundle: true,
  charset: "utf8",
  format: "cjs",
});
