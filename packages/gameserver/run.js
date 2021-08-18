#!/usr/bin/env node

import ts from "typescript";
import { build } from "esbuild";
import cpy from "cpy";
import path from "path";
import rimraf from "rimraf";
import { tmpdir } from 'os'
import fs from 'fs'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// import yargs from "yargs/yargs";
// import { hideBin } from "yargs/helpers";

const cwd = process.cwd();
// const { argv } = yargs(hideBin(process.argv));

function getTSConfig(_tsConfigFile = "tsconfig.json") {
  const tsConfigFile = ts.findConfigFile(cwd, ts.sys.fileExists, _tsConfigFile);
  if (!tsConfigFile) {
    throw new Error(`tsconfig.json not found in the current directory! ${cwd}`);
  }
  const configFile = ts.readConfigFile(tsConfigFile, ts.sys.readFile);
  const tsConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    cwd
  );
  return { tsConfig, tsConfigFile };
}

function esBuildSourceMapOptions(tsConfig) {
  const { sourceMap, inlineSources, inlineSourceMap } = tsConfig.options;

  // inlineSources requires either inlineSourceMap or sourceMap
  if (inlineSources && !inlineSourceMap && !sourceMap) {
    return false;
  }

  // Mutually exclusive in tsconfig
  if (sourceMap && inlineSourceMap) {
    return false;
  }

  if (inlineSourceMap) {
    return "inline";
  }

  return sourceMap;
}

const tempDir = tmpdir()

function getBuildMetadata(userConfig) {
  const { tsConfig, tsConfigFile } = getTSConfig(userConfig.tsConfigFile);

  const outDir = userConfig.outDir || tsConfig.options.outDir || "dist";

  const esbuildEntryPoints = userConfig.esbuild?.entryPoints || [];
  const srcFiles = [...tsConfig.fileNames, ...esbuildEntryPoints];
  const sourcemap = esBuildSourceMapOptions(tsConfig);
  const target =
    userConfig.esbuild?.target ||
    tsConfig?.raw?.compilerOptions?.target ||
    "es2020";
  const minify = userConfig.esbuild?.minify || false;
  const plugins = userConfig.esbuild?.plugins || [];

  const esbuildOptions = {
    outdir: outDir,
    entryPoints: srcFiles,
    sourcemap,
    target,
    minify,
    plugins,
    tsconfig: tsConfigFile,
  };

  const assetPatterns = userConfig.assets?.filePatterns || ["**"];

  const assetsOptions = {
    baseDir: userConfig.assets?.baseDir || "src",
    outDir: userConfig.assets?.outDir || outDir,
    patterns: [...assetPatterns, `!**/*.{ts,js,tsx,jsx}`],
  };

  return { outDir, esbuildOptions, assetsOptions };
}

async function buildSourceFiles(esbuildOptions) {
  console.log(esbuildOptions)
  return await build({
    ...esbuildOptions,
    bundle: false,
    target: 'node' + process.versions.node.split('.')[0],
    format: "esm",
    sourcemap: 'inline',
    // write: false,
    outdir: tempDir, // ignored if write is false
    platform: "node",
  });
}

async function copyNonSourceFiles({
  baseDir,
  outDir,
  patterns,
}) {
  const relativeOutDir = path.relative(baseDir, outDir);
  return await cpy(patterns, relativeOutDir, {
    cwd: baseDir,
    parents: true,
  });
}

async function main() {
  const configFilename = //(await argv)?.config || 
  "etsc.config.js";

  const config = {}//await readUserConfig(path.resolve(cwd, configFilename));

  const { outDir, esbuildOptions, assetsOptions } = getBuildMetadata(config);

  rimraf.sync(outDir);

  await Promise.all([
    buildSourceFiles(esbuildOptions),
    // copyNonSourceFiles(assetsOptions),
  ]);
  console.log(tempDir)
  console.log(fs.readdirSync(tempDir, { withFileTypes: true })
    // .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name))
  await import(tempDir + '/packages/gameserver/src/index.js')
}

console.time("Built in");

main()
  .then(() => {
    console.timeEnd("Built in");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });