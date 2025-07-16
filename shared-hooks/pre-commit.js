/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/


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
