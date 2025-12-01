#!/usr/bin/env node
import { build, context } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { rmSync, mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, 'dist');

function cleanDist() {
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });
}

async function buildBundle({ watch } = { watch: false }) {
  const entryPoints = [
    resolve(projectRoot, 'calorie-tracker-panel.js'),
    resolve(projectRoot, 'cards.js'),
  ];

  const options = {
    bundle: true,
    entryPoints,
    format: 'esm',
    target: ['es2017'],
    outdir: distDir,
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
    cleanDist();
  }
  await buildBundle({ watch });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
