const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/lambda.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  outfile: "dist/lambda.js",
  external: ["@sparticuz/chromium", "puppeteer-core"],
  minify: true,
});
