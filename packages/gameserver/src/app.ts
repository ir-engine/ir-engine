import config from '@xrengine/server-core/src/appconfig'
import fs from 'fs'
import path from 'path'
import favicon from 'serve-favicon'
import compress from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import swagger from 'feathers-swagger'
import { feathers } from '@feathersjs/feathers'
import express, { json, urlencoded, static as _static, rest, notFound, errorHandler } from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import AgonesSDK from '@google-cloud/agones-sdk'
import { Application } from '@xrengine/server-core/declarations'
import logger from '@xrengine/server-core/src/logger'
import channels from './channels'
import authentication from '@xrengine/server-core/src/user/authentication'
import sync from 'feathers-sync'
import { api } from '@xrengine/server-core/src/k8s'
import winston from 'winston'
import feathersLogger from 'feathers-logger'
import { EventEmitter } from 'events'
import services from '@xrengine/server-core/src/services'
import sequelize from '@xrengine/server-core/src/sequelize'
import { register } from 'trace-unhandled'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { SocketWebRTCServerTransport } from './SocketWebRTCServerTransport'
register()

export const createApp = (): Application => {
  const emitter = new EventEmitter()

  // Don't remove this comment. It's needed to format import lines nicely.

  const app = express(feathers()) as Application
  const agonesSDK = new AgonesSDK()

  app.set('nextReadyEmitter', emitter)

  if (config.gameserver.enabled) {
    try {
      app.configure(
        swagger({
          docsPath: '/openapi',
          docsJsonPath: '/openapi.json',
          uiIndex: path.join(process.cwd() + '/openapi.html'),
          // TODO: Relate to server config, don't hardcode this here
          specs: {
            info: {
              title: 'XREngine API Surface',
              description: 'APIs for the XREngine application',
              version: '1.0.0'
            },
            schemes: ['https'],
            securityDefinitions: {
              bearer: {
                type: 'apiKey',
                in: 'header',
                name: 'authorization'
              }
            },
            security: [{ bearer: [] }]
          }
        })
      )

      app.set('paginate', config.server.paginate)
      app.set('authentication', config.authentication)

      app.configure(sequelize)

      // Enable security, CORS, compression, favicon and body parsing
      app.use(helmet())
      app.use(
        cors({
          origin: true,
          credentials: true
        })
      )
      app.use(compress())
      app.use(json())
      app.use(urlencoded({ extended: true }))
      app.use(favicon(path.join(config.server.publicDir, 'favicon.ico')))

      // Set up Plugins and providers
      app.configure(rest())
      app.configure(
        socketio(
          {
            serveClient: false,
            pingTimeout: process.env.APP_ENV === 'development' ? 1200000 : 20000,
            cors: {
              origin: [
                'https://' + config.gameserver.clientHost,
                'capacitor://' + config.gameserver.clientHost,
                'ionic://' + config.gameserver.clientHost
              ],
              methods: ['OPTIONS', 'GET', 'POST'],
              allowedHeaders: '*',
              preflightContinue: true,
              credentials: true
            }
          },
          (io) => {
            Network.instance.transport = new SocketWebRTCServerTransport(app)
            Network.instance.transport.initialize()
            io.use((socket, next) => {
              console.log('GOT SOCKET IO HANDSHAKE', socket.handshake.query)
              ;(socket as any).feathers.socketQuery = socket.handshake.query
              ;(socket as any).socketQuery = socket.handshake.query
              next()
            })
          }
        )
      )

      if (config.redis.enabled) {
        app.configure(
          sync({
            uri:
              config.redis.password != null && config.redis.password !== ''
                ? `redis://${config.redis.address}:${config.redis.port}?password=${config.redis.password}`
                : `redis://${config.redis.address}:${config.redis.port}`
          })
        )
        app.sync.ready.then(() => {
          logger.info('Feathers-sync started')
        })
      }

      // Configure other middleware (see `middleware/index.js`)
      app.configure(authentication)
      // Set up our services (see `services/index.js`)

      app.configure(feathersLogger(winston))
      app.configure(services)

      if (config.gameserver.mode === 'realtime') {
        app.k8AgonesClient = api({
          endpoint: `https://${config.kubernetes.serviceHost}:${config.kubernetes.tcpPort}`,
          version: '/apis/agones.dev/v1',
          auth: {
            caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
            token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
          }
        })
        app.k8DefaultClient = api({
          endpoint: `https://${config.kubernetes.serviceHost}:${config.kubernetes.tcpPort}`,
          version: '/api/v1',
          auth: {
            caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
            token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
          }
        })
      }

      if (config.kubernetes.enabled || process.env.APP_ENV === 'development' || config.gameserver.mode === 'local') {
        agonesSDK.connect()
        agonesSDK.ready().catch((err) => {
          throw new Error(
            '\x1b[33mError: Agones is not running!. If you are in local development, please run xrengine/scripts/sh start-agones.sh and restart server\x1b[0m'
          )
        })
        app.agonesSDK = agonesSDK
        setInterval(() => agonesSDK.health(), 1000)

        app.configure(channels)
      } else {
        console.warn('Did not create gameserver')
      }

      app.use('/healthcheck', (req, res) => {
        res.sendStatus(200)
      })
    } catch (err) {
      console.log('Server init failure')
      console.log(err)
    }
  }

  app.use(errorHandler({ logger } as any))

  return app
}

process.on('exit', async () => {
  console.log('Server EXIT')
})

process.on('SIGTERM', async (err) => {
  console.log('Server SIGTERM')
  console.log(err)
})
process.on('SIGINT', () => {
  console.log('RECEIVED SIGINT')
  process.exit()
})

//emitted when an uncaught JavaScript exception bubbles
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION')
  console.log(err)
  process.exit()
})

//emitted whenever a Promise is rejected and no error handler is attached to it
process.on('unhandledRejection', (reason, p) => {
  console.log('UNHANDLED REJECTION')
  console.log(reason)
  console.log(p)
  process.exit()
})
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0' // Avoids DEPTH_ZERO_SELF_SIGNED_CERT error for self-signed certs
