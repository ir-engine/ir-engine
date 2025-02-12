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

import AgonesSDK from '@google-cloud/agones-sdk'
import fs from 'fs'
import https from 'https'
import psList from 'ps-list'

import { pipe } from '@ir-engine/common/src/utils/pipe'
import { getMutableState } from '@ir-engine/hyperflux'
import { Application } from '@ir-engine/server-core/declarations'
import config from '@ir-engine/server-core/src/appconfig'
import {
  configureK8s,
  configureOpenAPI,
  configurePrimus,
  configureRedis,
  createFeathersKoaApp
} from '@ir-engine/server-core/src/createApp'
import multiLogger from '@ir-engine/server-core/src/ServerLogger'
import { ServerMode, ServerState } from '@ir-engine/server-core/src/ServerState'

import { startTimer } from '@ir-engine/spatial/src/startTimer'
import channels from './channels'
import { InstanceServerState } from './InstanceServerState'
import { setupSocketFunctions } from './SocketFunctions'

const logger = multiLogger.child({ component: 'instanceserver' })

// import preloadLocation from './preload-location'

/**
 * @param status
 */

process.on('unhandledRejection', (error, promise) => {
  logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
})

/**
 * Ensure the instance server has loaded the world before allowing any users to connect.
 * @param app
 * @param primus
 */

export const instanceServerPipe = pipe(configureOpenAPI(), configurePrimus(true), configureRedis(), configureK8s()) as (
  app: Application
) => Application

export const start = async (): Promise<Application> => {
  const app = await createFeathersKoaApp(ServerMode.Instance, instanceServerPipe)
  startTimer()

  const serverState = getMutableState(ServerState)

  const agonesSDK = new AgonesSDK()

  agonesSDK.connect()
  agonesSDK.ready().catch((err) => {
    logger.error(err)
    throw new Error(
      '\x1b[33mError: Agones is not running!. If you are in local development, please run ir-engine/scripts/sh start-agones.sh and restart server\x1b[0m'
    )
  })
  serverState.agonesSDK.set(agonesSDK)

  setInterval(
    () =>
      agonesSDK.health((err) => {
        logger.error('Agones health check error:')
        logger.error(err)
      }),
    1000
  )

  app.configure(channels)

  const key = process.platform === 'win32' ? 'name' : 'cmd'
  if (!config.kubernetes.enabled) {
    const processList = await (
      await psList()
    ).filter((e) => {
      const regexp = /docker-compose up|docker-proxy|mysql/gi
      return e[key]?.match(regexp)
    })
    const dockerProcess = processList.find((c) => c[key]?.match(/docker-compose/))
    const dockerProxy = processList.find((c) => c[key]?.match(/docker-proxy/))
    const processMysql = processList.find((c) => c[key]?.match(/mysql/))
    const databaseService = (dockerProcess && dockerProxy) || processMysql

    if (!databaseService) {
      // // Check for child process with mac OSX
      // exec('docker ps | grep mariadb', (err, stdout, stderr) => {
      //   if (!stdout.includes('mariadb')) {
      //     throw new Error(
      //       '\x1b[33mError: DB process is not running or Docker is not running!. If you are in local development, please run ir-engine/scripts/start-containers.sh and restart server\x1b[0m'
      //     )
      //   }
      // })
    }
  }

  // SSL setup
  const certPath = config.server.certPath
  const certKeyPath = config.server.keyPath
  const useSSL = false

  const certOptions = {
    key: useSSL ? fs.readFileSync(certKeyPath) : null,
    cert: useSSL ? fs.readFileSync(certPath) : null
  } as any
  const port = Number(config.instanceserver.port)
  if (useSSL) {
    logger.info(`Starting instanceserver with HTTPS on port ${port}.`)
  } else {
    logger.info(
      `Starting instanceserver with NO HTTPS on ${port}, if you meant to use HTTPS try 'sudo bash generate-certs'`
    )
  }

  // http redirects for development
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

  // const server = useSSL
  //   ? https.createServer(certOptions, app as any).listen(port)
  //   : app.listen(port);

  const server = useSSL ? https.createServer(certOptions, app.callback()).listen(port) : await app.listen(port)

  if (useSSL) {
    app.setup(server)
  }

  // if (config.instanceserver.locationName != null) {
  //   logger.info('PRELOADING WORLD WITH LOCATION NAME %s', config.instanceserver.locationName)
  //   preloadLocation(config.instanceserver.locationName, app)
  // }

  process.on('unhandledRejection', (error, promise) => {
    logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
  })
  // if (process.env.APP_ENV === 'production' && fs.existsSync('/var/log')) {
  //   try {
  //     logger.info("Writing access log to '/var/log/api.access.log'");
  //     const access = fs.createWriteStream('/var/log/api.access.log');
  //     process.stdout.write = process.stderr.write = access.write.bind(access);
  //     logger.info('Log file write setup successfully');
  //   } catch(err) {
  //     logger.error(err, 'Access log write error');
  //   }
  // } else {
  //   logger.warn("Directory /var/log not found, not writing access log");
  // }
  server.on('listening', () =>
    logger.info('Feathers application started on %s://%s:%d', useSSL ? 'https' : 'http', config.server.hostname, port)
  )
  getMutableState(InstanceServerState).port.set(port)
  await new Promise((resolve) => {
    const primusWaitInterval = setInterval(() => {
      if (app.primus) {
        clearInterval(primusWaitInterval)
        resolve(null)
      }
    }, 100)
  })
  app.primus.on('connection', async (spark) => setupSocketFunctions(app, spark))
  return app
}
