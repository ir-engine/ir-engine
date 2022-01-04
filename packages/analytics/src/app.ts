import compress from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import { feathers } from '@feathersjs/feathers'
import express, { json, urlencoded, rest, errorHandler } from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import logger from '@xrengine/server-core/src/logger'
import authentication from '@xrengine/server-core/src/user/authentication'
import config from '@xrengine/server-core/src/appconfig'
import winston from 'winston'
import feathersLogger from 'feathers-logger'
import { EventEmitter } from 'events'
import services from '@xrengine/server-core/src/services'
import sequelize from '@xrengine/server-core/src/sequelize'
import { Application } from '@xrengine/server-core/declarations'

export const createApp = (): Application => {
  const emitter = new EventEmitter()

  // @ts-ignore
  const app = express(feathers()) as Application

  app.set('nextReadyEmitter', emitter)

  if (config.analytics.enabled) {
    try {
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
      app.use(json())
      app.use(urlencoded({ extended: true }))

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
      // Configure other middleware (see `middleware/index.js`)
      app.configure(authentication)
      // Set up our services (see `services/index.js`)
      app.configure(feathersLogger(winston))
      app.configure(services)

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
