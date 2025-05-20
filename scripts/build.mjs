// @ts-check
import esbuild from "esbuild";
import { copyFile, readFile, writeFile, rm } from "node:fs/promises";
import { glob } from "glob";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * @type {esbuild.BuildOptions}
 */
const sharedOptions = {
  sourcemap: "external",
  sourcesContent: true,
  minify: false,
  allowOverwrite: true,
  packages: "external",
  platform: "neutral",
  format: "esm",
  target: "es2022",
};

async function main() {
  // Start with a clean slate
  await rm("pkg", { recursive: true, force: true });

  // Build the source code for a neutral platform as ESM
  await esbuild.build({
    entryPoints: await glob(["./src/*.ts", "./src/**/*.ts"]),
    outdir: "pkg/dist-src",
    bundle: false,
    ...sharedOptions,
    sourcemap: false,
  });

  // Remove the types file from the dist-src folder
  const typeFiles = await glob([
    "./pkg/dist-src/**/types.js.map",
    "./pkg/dist-src/**/types.js",
  ]);
  for (const typeFile of typeFiles) {
    await rm(typeFile);
  }

  const entryPoints = ["./pkg/dist-src/index.js"];

  // Build an ESM bundle
  await esbuild.build({
    entryPoints,
    outdir: "pkg/dist-bundle",
    bundle: true,
    ...sharedOptions,
  });

  // Generate types using tsc, output to pkg/dist-types
  await execAsync("tsc --emitDeclarationOnly --declaration --outDir pkg/dist-types");

  // Copy the README, LICENSE to the pkg folder
  await copyFile("LICENSE", "pkg/LICENSE");
  await copyFile("README.md", "pkg/README.md");

  // Handle the package.json
  let pkg = JSON.parse((await readFile("package.json", "utf8")).toString());
  // Remove unnecessary fields from the package.json
  delete pkg.scripts;
  delete pkg.prettier;
  delete pkg.release;
  delete pkg.jest;
  await writeFile(
    "pkg/package.json",
    JSON.stringify(
      {
        ...pkg,
        files: ["dist-*/**", "bin/**"],
        types: "./dist-types/index.d.ts",
        exports: {
          ".": {
            types: "./dist-types/index.d.ts",
            import: "./dist-bundle/index.js",
            default: "./dist-bundle/index.js",
          },
        },
        sideEffects: false,
      },
      null,
      2,
    ),
  );
}

// Properly handle errors and top-level await
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
