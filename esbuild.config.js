import esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/lambda.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  outfile: "dist/lambda.js",
  external: ["src/index.ts"],
  format: "cjs",
  minify: true,
});
