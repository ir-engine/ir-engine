#!/usr/bin/env node

// Cross-platform pre-commit hook using Node.js
// Compatible with Mac, Windows, and Linux

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find the root project directory
const scriptDir = __dirname;
const rootProjectDir = path.resolve(scriptDir, '..');

// Change to root project directory
process.chdir(rootProjectDir);

console.log(`Running shared pre-commit hooks from: ${rootProjectDir}`);

try {
    // Run add-license-headers
    console.log('Adding license headers...');
    execSync('npm run add-license-headers', { stdio: 'inherit' });
    
    // Run format-staged (lint-staged)
    console.log('Running lint-staged...');
    execSync('npm run format-staged', { stdio: 'inherit' });
    
    console.log('All pre-commit checks passed');
    process.exit(0);
} catch (error) {
    console.error('Pre-commit checks failed');
    process.exit(1);
}
