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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import packageRoot from 'app-root-path'
import fs from 'fs'
import https from 'https'
import net from 'net'
import { join } from 'path'
import serveStatic from 'serve-static'

import kill from 'kill-port'
import config from './appconfig'

const serve = process.env.TEST === 'true' ? serveStatic('../server/upload_test/') : serveStatic('../server/upload/')

let server: https.Server = null!
const options = {
  key: fs.readFileSync(join(packageRoot.path, process.env.KEY || 'certs/key.pem')),
  cert: fs.readFileSync(join(packageRoot.path, process.env.CERT || 'certs/cert.pem'))
}

const createTestFileServer = (port: number, isServerRunning: boolean) => {
  if (isServerRunning) return

  server = https.createServer(options, (req, res) => {
    serve(req, res, () => {})
  })
  server.listen(port)
}

export const StartTestFileServer = () => {
  const port = config.server.localStorageProviderPort
  isPortTaken(port, createTestFileServer)
}

const isPortTaken = (port, fn) => {
  const tester = net
    .createServer()
    .once('error', (err) => {
      tester.close()
      kill(port, 'tcp').then(() => {
        fn(port, false)
      })
    })
    .once('listening', () => {
      tester
        .once('close', () => {
          fn(port, false)
        })
        .close()
    })
    .listen(port)
}
