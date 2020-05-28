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

// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers())

app.configure(
  swagger({
    docsPath: '/docs',
    docsJsonPath: '/docs.json',
    uiIndex: path.join(__dirname, '../docs.html'),
    // TODO: Relate to server config, don't hardcode this here
    specs: {
      info: {
        title: 'XRChat API Surface',
        description: 'APIs for the XRChat application',
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
// Host the public folder
app.use('/', express.static(config.server.publicDir))

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

// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger } as any))

app.hooks(appHooks)

export default app
