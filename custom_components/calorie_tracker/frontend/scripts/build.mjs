#!/usr/bin/env node
import { build, context } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { rmSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const srcDir = resolve(projectRoot, 'src');
const outputDir = projectRoot;
const chunkDir = resolve(outputDir, 'chunks');
const assetDir = resolve(outputDir, 'assets');
const generatedFiles = [
  'cards.js',
  'cards.js.map',
  'calorie-tracker-panel.js',
  'calorie-tracker-panel.js.map',
].map((file) => resolve(outputDir, file));

function cleanOutput() {
  [chunkDir, assetDir].forEach((dir) =>
    rmSync(dir, { recursive: true, force: true })
  );

  generatedFiles.forEach((file) => rmSync(file, { force: true }));
}

async function buildBundle({ watch } = { watch: false }) {
  const entryPoints = [
    resolve(srcDir, 'calorie-tracker-panel.js'),
    resolve(srcDir, 'cards.js'),
  ];

  const options = {
    bundle: true,
    entryPoints,
    format: 'esm',
    target: ['es2017'],
    outdir: outputDir,
    entryNames: '[name]',
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: 'assets/[name]-[hash]',
    splitting: true,
    sourcemap: true,
    minify: true,
    logLevel: 'info',
    treeShaking: true,
    legalComments: 'external',
  };

  if (watch) {
    const ctx = await context(options);
    await ctx.watch();
    console.log('Watching for changes...');
    return;
  }

  await build(options);
  console.log('Build completed');
}

async function main() {
  const watch = process.argv.includes('--watch');
  if (!watch) {
    cleanOutput();
  }
  await buildBundle({ watch });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
