#!/bin/bash

## Bundles benchmark.js to a tarball with its own dependencies
rm -f MyTests.zip
rm -rf dist/
npx tsc
cp package.json dist/
cd dist
npm install
npx npm-bundle

## Extracts the npm bundle to a zip and cleans up the intermediate files
zip -r MyTests.zip *.tgz
mv MyTests.zip ..
