import path from 'path'
import favicon from 'serve-favicon'
import compress from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import swagger from 'feathers-swagger'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'

import { Application } from './declarations'
import logger from './logger'
import middleware from './middleware'
import services from './services'
import appHooks from './app.hooks'
import channels from './channels'
import authentication from './authentication'
import sequelize from './sequelize'
import config from './config'

import winston from 'winston'
// @ts-ignore
import feathersLogger from 'feathers-logger'
import next from 'next'
import { EventEmitter } from 'events'

const emitter = new EventEmitter()

// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers())

app.set('nextReadyEmitter', emitter)

if (config.server.enabled) {
  app.configure(
    swagger({
      docsPath: '/docs',
      docsJsonPath: '/docs.json',
      uiIndex: path.join(__dirname, '../docs.html'),
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
  app.configure(socketio())

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

  app.use('/healthcheck', (req, res) => {
    res.sendStatus(200)
  })
}

app.use(express.errorHandler({ logger } as any))

if (config.client.enabled) {
  const clientApp = next({
    dir: path.join(config.server.rootDir, '/lib/client'),
    dev: process.env.NODE_ENV !== 'production'
  })

  const clientAppHandler = clientApp.getRequestHandler()

  app.use(express.static(config.server.rootDir + '/node_modules/xr3-spoke/dist/'))
  app.all('/spoke/*', (req, res) => res.sendFile(path.join(config.server.rootDir, '/node_modules/xr3-spoke/dist/spoke/index.html')))

  clientApp.prepare().then(() => {
    app.all('*', (req, res) => {
      return clientAppHandler(req, res)
    })
    app.use('/', express.static(config.server.publicDir))
    app.use(express.notFound())
    emitter.emit('next-ready')
  }).catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  })
}

export default app
