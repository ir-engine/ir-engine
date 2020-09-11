import fs from 'fs'
import path from 'path'
import favicon from 'serve-favicon'
import compress from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import swagger from 'feathers-swagger'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import AgonesSDK from '@google-cloud/agones-sdk'

import { Application } from '../declarations'
import logger from './logger'
import middleware from '../middleware'
import services from '../services'
import appHooks from './app.hooks'
import channels from './channels'
import authentication from './authentication'
import sequelize from './sequelize'
import config from '../config'
import sync from 'feathers-sync'
import K8s from 'k8s'

import { WebRTCGameServer } from "../gameserver/WebRTCGameServer"

import winston from 'winston'
import feathersLogger from 'feathers-logger'
import { EventEmitter } from 'events'

const emitter = new EventEmitter()

// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers())
const agonesSDK = new AgonesSDK()

function healthPing (agonesSDK: AgonesSDK): void {
  agonesSDK.health()
  setTimeout(() => healthPing(agonesSDK), 1000)
}

app.set('nextReadyEmitter', emitter)

if (config.server.enabled) {
  app.configure(
    swagger({
      docsPath: '/openapi',
      docsJsonPath: '/openapi.json',
      uiIndex: path.join(__dirname, '../openapi.html'),
      // TODO: Relate to server config, don't hardcode this here
      specs: {
        info: {
          title: 'XR3ngine API Surface',
          description: 'APIs for the XR3ngine application',
          version: '1.0.0'
        }
      }
    })
  )

  app.set('paginate', config.server.paginate)
  app.set('authentication', config.authentication)

  app.configure(sequelize)

  // Enable security, CORS, compression, favicon and body parsing
  app.use(helmet())
  app.use(cors({
    origin: config.client.url,
    credentials: true
  }))
  app.use(compress())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(favicon(path.join(config.server.publicDir, 'favicon.ico')))

  // Set up Plugins and providers
  app.configure(express.rest())
  app.configure(socketio((io) => {
    io.use((socket, next) => {
      (socket as any).feathers.socketQuery = socket.handshake.query;
      (socket as any).socketQuery = socket.handshake.query;
      next()
    })
  }))

  if (config.redis.enabled) {
    app.configure(sync({
      uri: config.redis.password != null ? `redis://${config.redis.address}:${config.redis.port}?password=${config.redis.password}` : `redis://${config.redis.address}:${config.redis.port}`
    }));

    (app as any).sync.ready.then(() => {
      console.log('Feathers-sync started')
    })
  }

  // Configure other middleware (see `middleware/index.js`)
  app.configure(middleware)
  app.configure(authentication)
  // Set up our services (see `services/index.js`)

  app.configure(feathersLogger(winston))

  app.configure(services)
  // Set up event channels (see channels.js)
  app.configure(channels)

  // Host the public folder
  // Configure a middleware for 404s and the error handler

  // Host the public folder
  // Configure a middleware for 404s and the error handler

  app.hooks(appHooks)

  if ((process.env.KUBERNETES === 'true' && config.server.mode === 'realtime') || process.env.NODE_ENV === 'development' || config.server.mode === 'local') {
    agonesSDK.connect()
    agonesSDK.ready();
    (app as any).agonesSDK = agonesSDK
    healthPing(agonesSDK)

    // Create new gameserver instance
    const gameServer = new WebRTCGameServer()
    console.log("Created new gameserver instance")
    console.log(gameServer)
  } else {
    console.log("Could not create new game server instance!!")
  }

  if (config.server.mode === 'api') {
    (app as any).k8Client = K8s.api({ endpoint: `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_PORT_443_TCP_PORT}`, version: '/apis/agones.dev/v1', auth: { caCert: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'), token: fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token') } })
  }

  app.use('/healthcheck', (req, res) => {
    res.sendStatus(200)
  })
}

app.use(express.errorHandler({ logger } as any))

const editorPath = process.env.NODE_ENV === 'production' ? path.join(config.server.nodeModulesDir, '/xr3-editor/dist') : path.join(config.server.rootDir, '/node_modules/xr3-editor/dist')
app.use(express.static(editorPath))
app.all('/editor/*', (req, res) => res.sendFile(path.join(editorPath, 'editor/index.html')))

export default app
