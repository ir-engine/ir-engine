
/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


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