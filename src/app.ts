import dotenv from 'dotenv'

import path from 'path'
import favicon from 'serve-favicon'
import compress from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import swagger from 'feathers-swagger'

import feathers from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
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
// Don't remove this comment. It's needed to format import lines nicely.

dotenv.config()

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

// Load app configuration
app.configure(configuration())

app.configure(sequelize)

// Enable security, CORS, compression, favicon and body parsing
app.use(helmet())
app.use(cors({
    origin: process.env.APP_HOST,
    credentials: true
}))
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
// Host the public folder
app.use('/', express.static(app.get('public')))

// Set up Plugins and providers
app.configure(express.rest())
app.configure(socketio())

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware)
app.configure(authentication)
// Set up our services (see `services/index.js`)

app.configure(services)
// Set up event channels (see channels.js)
app.configure(channels)

// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger } as any))

app.hooks(appHooks)

export default app
