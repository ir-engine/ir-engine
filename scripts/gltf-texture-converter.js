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

/* eslint-disable @typescript-eslint/no-var-requires */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory where this script is located
const scriptDir = __dirname;
const gltfToolsPath = path.join(scriptDir, 'gltf-texture-converter.sh');

// Check if the shell script exists
if (!fs.existsSync(gltfToolsPath)) {
    console.error('Error: gltf-texture-converter.sh not found in scripts directory');
    process.exit(1);
}

// Make sure the shell script is executable (Unix-like systems)
try {
    fs.chmodSync(gltfToolsPath, '755');
} catch (error) {
    // Ignore chmod errors on Windows
}

// Get command line arguments (skip the first two: node and script path)
const args = process.argv.slice(2);

// Determine the shell to use
let shell;
let shellArgs;

if (process.platform === 'win32') {
    // Windows: use bash if available (WSL, Git Bash, etc.)
    if (process.env.WSL_DISTRO_NAME || process.env.MSYS) {
        shell = 'bash';
        shellArgs = [gltfToolsPath, ...args];
    } else {
        // Try to find bash in common locations
        const possibleBashPaths = [
            'C:\\Program Files\\Git\\bin\\bash.exe',
            'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
            process.env.GIT_BASH_PATH ? `${process.env.GIT_BASH_PATH}\\bash.exe` : null
        ].filter(Boolean);

        let bashFound = false;
        for (const bashPath of possibleBashPaths) {
            if (fs.existsSync(bashPath)) {
                shell = bashPath;
                shellArgs = [gltfToolsPath, ...args];
                bashFound = true;
                break;
            }
        }

        if (!bashFound) {
            console.error('Error: Bash not found. Please install Git Bash or WSL to use gltf-texture-converter on Windows.');
            console.error('Alternatively, you can run the script directly with bash if available.');
            process.exit(1);
        }
    }
} else {
    // Unix-like systems (Linux, macOS)
    shell = 'bash';
    shellArgs = [gltfToolsPath, ...args];
}

// Spawn the process
const child = spawn(shell, shellArgs, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env
});

// Handle process events
child.on('error', (error) => {
    console.error('Error spawning process:', error.message);
    process.exit(1);
});

child.on('close', (code) => {
    process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    child.kill('SIGTERM');
}); 