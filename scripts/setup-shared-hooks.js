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

// Cross-platform Node.js script to configure shared git hooks
// Compatible with Mac, Windows, and Linux

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const sharedHooksDir = path.join(rootDir, 'shared-hooks');
const projectsDir = path.join(rootDir, 'packages', 'projects', 'projects');

console.log('Setting up shared git hooks for nested repositories...');
console.log(`Root directory: ${rootDir}`);
console.log(`Shared hooks directory: ${sharedHooksDir}`);
console.log(`Platform: ${process.platform}`);

// Find all nested git repositories
function findGitRepos(dir) {
    const repos = [];
    
    function searchDir(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    if (item === '.git') {
                        repos.push(path.dirname(itemPath));
                    } else {
                        searchDir(itemPath);
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    searchDir(dir);
    return repos;
}

const nestedRepos = findGitRepos(projectsDir);

console.log(`\nFound ${nestedRepos.length} nested repositories:`);

for (const repo of nestedRepos) {
    console.log(`\nConfiguring repository: ${repo}`);
    
    // Calculate relative path from repo to shared hooks
    const relativePath = path.relative(repo, sharedHooksDir);
    
    // Convert to forward slashes for Git (works on all platforms)
    const gitPath = relativePath.replace(/\\/g, '/');
    
    console.log(`  Setting core.hooksPath to: ${gitPath}`);
    
    try {
        // Configure the repository to use shared hooks
        execSync(`git config core.hooksPath "${gitPath}"`, { 
            cwd: repo,
            stdio: 'pipe'
        });
        
        // Verify the configuration
        const configuredPath = execSync('git config core.hooksPath', { 
            cwd: repo,
            encoding: 'utf8'
        }).trim();
        
        console.log(`  ✅ Verified configuration: ${configuredPath}`);
    } catch (error) {
        console.log(`  ❌ Failed to configure: ${error.message}`);
    }
}

console.log('\n✅ Setup complete!');
console.log('\nTo test, try making a commit in any of the nested repositories.');
console.log('To revert, run: git config --unset core.hooksPath (in each repo)');
