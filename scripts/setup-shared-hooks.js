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
