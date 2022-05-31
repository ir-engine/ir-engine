import express, { static as _static, errorHandler, json, rest, urlencoded } from '@feathersjs/express'
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio'
import * as k8s from '@kubernetes/client-node'
import compress from 'compression'
import cors from 'cors'
import { EventEmitter } from 'events'
import swagger from 'feathers-swagger'
import sync from 'feathers-sync'
import helmet from 'helmet'
import path from 'path'
import { Socket } from 'socket.io'

import { pipe } from '@xrengine/common/src/utils/pipe'
import { Application } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import logger from '@xrengine/server-core/src/logger'
import sequelize from '@xrengine/server-core/src/sequelize'
import services from '@xrengine/server-core/src/services'
import authentication from '@xrengine/server-core/src/user/authentication'

import { createDefaultStorageProvider, createIPFSStorageProvider } from './media/storageprovider/storageprovider'

export const configureOpenAPI = () => (app: Application) => {
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
  return app
}

export const configureSocketIO =
  (gameserver = false, onSocket = (app: Application, socket: Socket) => {}) =>
  (app: Application) => {
    const origin = [
      'https://' + config.server.clientHost,
      'capacitor://' + config.server.clientHost,
      'ionic://' + config.server.clientHost
    ]
    if (!gameserver) origin.push('https://localhost:3001')
    app.configure(
      socketio(
        {
          serveClient: false,
          cors: {
            origin,
            methods: ['OPTIONS', 'GET', 'POST'],
            allowedHeaders: '*',
            preflightContinue: gameserver,
            credentials: true
          }
        },
        (io) => {
          io.use((socket, next) => {
            ;(socket as any).feathers.socketQuery = socket.handshake.query
            ;(socket as any).socketQuery = socket.handshake.query
            onSocket(app, socket)
            next()
          })
        }
      )
    )
    return app
  }

export const configureRedis = () => (app: Application) => {
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
      logger.info('Feathers-sync started.')
    })
  }
  return app
}

export const configureK8s = () => (app: Application) => {
  if (config.kubernetes.enabled) {
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()

    app.k8AgonesClient = kc.makeApiClient(k8s.CustomObjectsApi)
    app.k8DefaultClient = kc.makeApiClient(k8s.CoreV1Api)
    app.k8AppsClient = kc.makeApiClient(k8s.AppsV1Api)
    app.k8BatchClient = kc.makeApiClient(k8s.BatchV1Api)
  }
  return app
}

export const serverPipe = pipe(configureOpenAPI(), configureSocketIO(), configureRedis(), configureK8s()) as (
  app: Application
) => Application

export const createFeathersExpressApp = (configurationPipe = serverPipe): Application => {
  createDefaultStorageProvider()

  if (config.ipfs.enabled) {
    createIPFSStorageProvider()
  }

  const app = express(feathers()) as Application
  app.set('nextReadyEmitter', new EventEmitter())

  // Feathers authentication-oauth will only append the port in production, but then it will also
  // hard-code http as the protocol, so manually mashing host + port together if in local.
  app.set('host', config.server.local ? config.server.hostname + ':' + config.server.port : config.server.hostname)
  app.set('port', config.server.port)

  app.set('paginate', config.server.paginate)
  app.set('authentication', config.authentication)

  configurationPipe(app)

  // Feathers authentication-oauth will use http for its redirect_uri if this is 'dev'.
  // Doesn't appear anything else uses it.
  app.set('env', 'production')

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

  app.configure(rest())

  // Configure other middleware (see `middleware/index.js`)
  app.configure(authentication)

  // Set up our services (see `services/index.js`)
  app.configure(services)

  app.use('/healthcheck', (req, res) => {
    res.sendStatus(200)
  })

  app.use(errorHandler({ logger }))

  return app
}
