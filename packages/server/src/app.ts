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
import logger from '@xrengine/server-core/src/logger'
import channels from './channels'
import authentication from '@xrengine/server-core/src/user/authentication'
import config from '@xrengine/server-core/src/appconfig'
import sync from 'feathers-sync'
import { api } from '@xrengine/server-core/src/k8s'
import winston from 'winston'
import feathersLogger from 'feathers-logger'
import { EventEmitter } from 'events'
import services from '@xrengine/server-core/src/services'
import sequelize from '@xrengine/server-core/src/sequelize'
import { Application } from '@xrengine/server-core/declarations'

const emitter = new EventEmitter()

const app = express(feathers()) as any as Application

app.set('nextReadyEmitter', emitter)

if (config.server.enabled) {
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

    //Feathers authentication-oauth will use http for its redirect_uri if this is 'dev'.
    //Doesn't appear anything else uses it.
    app.set('env', 'production')
    //Feathers authentication-oauth will only append the port in production, but then it will also
    //hard-code http as the protocol, so manually mashing host + port together if in local.
    app.set('host', config.server.local ? config.server.hostname + ':' + config.server.port : config.server.hostname)
    app.set('port', config.server.port)
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
    app.use(urlencoded({ extended: true }))
    app.use(json())
    app.use(favicon(path.join(config.server.publicDir, 'favicon.ico')))

    // Set up Plugins and providers
    app.configure(rest())
    app.configure(
      socketio(
        {
          serveClient: false,
          cors: {
            origin: [
              'https://' + config.server.clientHost,
              'capacitor://' + config.server.clientHost,
              'ionic://' + config.server.clientHost,
              'https://localhost:3001'
            ],
            methods: ['OPTIONS', 'GET', 'POST'],
            allowedHeaders: '*',
            credentials: true
          }
        },
        (io) => {
          io.use((socket, next) => {
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
    // Set up event channels (see channels.js)
    app.configure(channels)

    if (config.server.mode === 'api' || config.server.mode === 'realtime') {
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
      app.k8AppsClient = api({
        endpoint: `https://${config.kubernetes.serviceHost}:${config.kubernetes.tcpPort}`,
        version: '/apis/apps/v1',
        auth: {
          caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'),
          token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token')
        }
      })
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

export default app
