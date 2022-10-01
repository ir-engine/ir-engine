import AgonesSDK from '@google-cloud/agones-sdk'
import { exec } from 'child_process'
import fs from 'fs'
import https from 'https'
import psList from 'ps-list'

import { pipe } from '@xrengine/common/src/utils/pipe'

import '@xrengine/engine/src/patchEngineNode'

import { Socket } from 'socket.io'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { Application, ServerMode } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import {
  configureK8s,
  configureOpenAPI,
  configureRedis,
  configureSocketIO,
  createFeathersExpressApp
} from '@xrengine/server-core/src/createApp'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

import channels from './channels'
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
 * @param socket
 */
const onSocket = async (app: Application, socket: Socket) => {
  if (!getEngineState().joinedWorld.value) {
    await new Promise((resolve) => matchActionOnce(EngineActions.joinedWorld.matches, resolve))
  }
  setupSocketFunctions(app.transport, socket)
}

export const instanceServerPipe = pipe(
  configureOpenAPI(),
  configureSocketIO(true, onSocket),
  configureRedis(),
  configureK8s()
) as (app: Application) => Application

export const start = async (): Promise<Application> => {
  const app = createFeathersExpressApp(ServerMode.Instance, instanceServerPipe)

  const agonesSDK = new AgonesSDK()

  agonesSDK.connect()
  agonesSDK.ready().catch((err) => {
    logger.error(err)
    throw new Error(
      '\x1b[33mError: Agones is not running!. If you are in local development, please run xrengine/scripts/sh start-agones.sh and restart server\x1b[0m'
    )
  })
  app.agonesSDK = agonesSDK
  setInterval(() => agonesSDK.health(), 1000)

  app.configure(channels)

  /**
   * When using local dev, to properly test multiple worlds for portals we
   * need to programatically shut down and restart the instanceserver process.
   */
  if (!config.kubernetes.enabled) {
    app.restart = () => {
      require('child_process').spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      process.exit(0)
    }
  }

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
      //       '\x1b[33mError: DB proccess is not running or Docker is not running!. If you are in local development, please run xrengine/scripts/start-db.sh and restart server\x1b[0m'
      //     )
      //   }
      // })
    }
  }

  // SSL setup
  const certPath = config.server.certPath
  const certKeyPath = config.server.keyPath
  const useSSL = !config.noSSL && (config.localBuild || !config.kubernetes.enabled) && fs.existsSync(certKeyPath)

  const certOptions = {
    key: useSSL ? fs.readFileSync(certKeyPath) : null,
    cert: useSSL ? fs.readFileSync(certPath) : null
  } as any
  const port = config.instanceserver.port
  if (useSSL) {
    logger.info(`Starting instanceserver with HTTPS on port ${port}.`)
  } else {
    logger.info(
      `Starting instanceserver with NO HTTPS on ${port}, if you meant to use HTTPS try 'sudo bash generate-certs'`
    )
  }

  // http redirects for development
  if (useSSL) {
    app.use((req, res, next) => {
      if (req.secure) {
        // request was via https, so do no special handling
        next()
      } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url)
      }
    })
  }

  // const server = useSSL
  //   ? https.createServer(certOptions, app as any).listen(port)
  //   : app.listen(port);

  const server = useSSL ? https.createServer(certOptions, app as any).listen(port) : await app.listen(port)

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

  return app
}
