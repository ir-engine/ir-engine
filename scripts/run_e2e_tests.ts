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

import childProcess from 'child_process'
import killPort from 'kill-port'

import config from '@etherealengine/server-core/src/appconfig'

// we may need an alternative to kill-port for mac & windows

const killports = () => {
  killPort(config.server.port)
  killPort(config.instanceserver.port)
  killPort(config.instanceserver.mediaPort)
  killPort(process.env.CORS_SERVER_PORT)
  killPort(process.env.VITE_APP_PORT)
  killPort(process.env.LOCAL_STORAGE_PROVIDER_PORT)
}

killports()
const logOutput = (child) => {
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', function (data) {
    console.log(data)
  })
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', function (data) {
    console.log(data)
  })
}

const devStack = childProcess.spawn('npm', ['run', 'dev'], { shell: process.platform === 'win32' })
logOutput(devStack)
const lernaE2E = childProcess.spawn('npx', ['lerna', 'run', 'test-e2e'], { shell: process.platform === 'win32' })
logOutput(lernaE2E)
lernaE2E.on('exit', (exitCode) => {
  console.log(`'lerna run test-e2e' exited with exit code`, exitCode)
  devStack.kill(exitCode!)
  process.exit(exitCode!)
})
devStack.on('exit', (exitCode) => {
  console.log(`'npm run dev' exited with exit code`, exitCode)
})
process.on('exit', (exitCode) => {
  console.log(`'npm run test-e2e' exited with exit code`, exitCode)
  killports()
  if (!lernaE2E.killed) lernaE2E.kill(exitCode)
  if (!devStack.killed) devStack.kill(exitCode)
})
