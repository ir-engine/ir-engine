#!/usr/bin/env node

// Cross-platform pre-commit hook using Node.js
// Compatible with Mac, Windows, and Linux

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find the root project directory
const scriptDir = __dirname;
const rootProjectDir = path.resolve(scriptDir, '..');
const currentRepo = process.cwd();

// Determine if we're running in the main repo or a nested repo
const isMainRepo = currentRepo === rootProjectDir;

if (isMainRepo) {
    console.log(`Running pre-commit hooks in MAIN repository: ${rootProjectDir}`);
} else {
    console.log(`Running pre-commit hooks in NESTED repository: ${currentRepo}`);
    console.log(`Main repository: ${rootProjectDir}`);
}

// Change to root project directory to access node_modules and scripts
process.chdir(rootProjectDir);

try {
    // Run add-license-headers (only in main repository)
    if (isMainRepo) {
        console.log('Adding license headers (main repo only)...');
        execSync('npm run add-license-headers', { stdio: 'inherit' });
    } else {
        console.log('Skipping license headers (nested repo - handled by main repo)');
    }

    // Run format-staged (lint-staged)
    console.log('Running lint-staged...');
    execSync('npm run format-staged', { stdio: 'inherit' });

    console.log('All pre-commit checks passed');
    process.exit(0);
} catch (error) {
    console.error('Pre-commit checks failed');
    process.exit(1);
}
