#!/usr/bin/env node
const { execSync } = require('child_process');

// Passed project name
const repoName = process.argv[2];

// Executes a command in bash
const runCommand = (command) => {
  try { // try to execute command
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (e) { // command failed
    console.error(`Failed to execute ${command}`, e);
    return false;
  }
  return true; // command succeeded
};

// Checkout repo
console.log(`Cloning as ${repoName}...`);
const gitCheckoutCommand = `git clone --depth 1 https://github.com/etherealengine/etherealengine ${repoName}`;
const checkedOut = runCommand(gitCheckoutCommand);
if (!checkedOut) process.exitCode = -1;

// Clone config, install deps
console.log('Cloning config, installing deps...');
const installCommand = `cd ${repoName}/ && cp .env.local.default .env.local && npm install`;
const install = runCommand(installCommand);
if (!install) process.exitCode = -1;

// Build docker containers
console.log('Building docker containers...');
const buildContainersCommand = `cd ./${repoName} && npm run dev-docker`;
const buildContainers = runCommand(buildContainersCommand);
if (!buildContainers) process.exitCode = -1;

// Init db
console.log('Initializing db...');
const initDbCommand = `cd ./${repoName} && npm run dev-reinit`;
const initDb = runCommand(initDbCommand);
if (!initDb) process.exitCode = -1;

// Done!
console.log('Dev Setup complete.');
console.log(`Run 'cd ${repoName} && npm run dev'`);