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

import { Application, feathers } from '@feathersjs/feathers'
import { koa } from '@feathersjs/koa'
import { ServiceTypes } from '@ir-engine/common/declarations'
import primus from '@ir-engine/server-core/src/util/primus' // todo pull out server import inside primus
import fs from 'fs'
import https from 'https'
import healthcheck from 'koa-simple-healthcheck'
import path from 'path'

const cwd = process.cwd()

// Types for `app.set(name, value)` and `app.get(name)`
export type Configuration = {
  clientHost: string
  clientPort: number | null
  serverHost: string
  serverPort: number
  certPath: string | null
  keyPath: string | null
}

export const createApp = (services: (app: Application) => void, config: Configuration) => {
  const app = koa(feathers<ServiceTypes, Configuration>())

  const origin = config.clientPort
    ? 'https://' + config.clientHost + ':' + config.clientPort
    : 'https://' + config.clientHost

  app.use(healthcheck())

  // primus
  app.configure(
    primus(
      {
        transformer: 'websockets',
        origins: origin,
        methods: ['OPTIONS', 'GET', 'POST'],
        pingInterval: 10000,
        pingTimeout: 30000,
        headers: '*',
        credentials: false
      },
      (primus) => {
        primus.use((message, socket, next) => {
          message.feathers.socketQuery = message.query
          message.socketQuery = message.query
          message.feathers.forwarded = message.forwarded
          next()
        })
      }
    )
  )

  app.configure(services)

  const certKeyPath = config.keyPath ? path.resolve(cwd, config.keyPath) : null
  const certPath = config.certPath ? path.resolve(cwd, config.certPath) : null

  const useSSL = certKeyPath && certPath && fs.existsSync(certKeyPath) && fs.existsSync(certPath)

  const certOptions = {
    key: useSSL ? fs.readFileSync(certKeyPath) : null,
    cert: useSSL ? fs.readFileSync(certPath) : null
  }

  if (useSSL) {
    console.info('Starting server with HTTPS')
  } else {
    console.info("Starting server with NO HTTPS, if you meant to use HTTPS try 'sudo bash generate-certs'")
  }

  if (useSSL) {
    app.use(async (ctx, next) => {
      if (ctx.secure) {
        // request was via https, so do no special handling
        await next()
      } else {
        // request was via http, so redirect to https
        ctx.redirect('https://' + ctx.headers.host + ctx.url)
      }
    })
  }

  const server = useSSL
    ? https.createServer(certOptions as any, app.callback()).listen(config.serverPort)
    : app.listen(config.serverPort)

  if (useSSL) {
    app.setup(server)
  }

  return app
}
