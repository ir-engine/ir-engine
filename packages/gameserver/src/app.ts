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
import { isDev } from '@xrengine/common/src/utils/isDev'
import dotenv from 'dotenv'
import { DataTypes, Sequelize } from 'sequelize'
register()

dotenv.config()
const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

export const createApp = async (): Promise<Application> => {
  const emitter = new EventEmitter()

  // Don't remove this comment. It's needed to format import lines nicely.

  // @ts-ignore
  const app = express(feathers()) as Application
  const agonesSDK = new AgonesSDK()

  app.set('nextReadyEmitter', emitter)

  const sequelizeClient = new Sequelize({
    ...db,
    define: {
      freezeTableName: true
    }
  })
  await sequelizeClient.sync()

  const gameServerSetting = sequelizeClient.define('gameServerSetting', {
    clientHost: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const redisSetting = sequelizeClient.define('redisSetting', {
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const serverSetting = sequelizeClient.define('serverSetting', {
    publicDir: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paginate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
      validate: {
        max: 100
      }
    }
  })

  const authenticationSetting = sequelizeClient.define('authentication', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    service: {
      type: DataTypes.STRING,
      allowNull: true
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authStrategies: {
      type: DataTypes.JSON,
      allowNull: true
    },
    local: {
      type: DataTypes.JSON,
      allowNull: true
    },
    jwtOptions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    bearerToken: {
      type: DataTypes.JSON,
      allowNull: true
    },
    callback: {
      type: DataTypes.JSON,
      allowNull: true
    },
    oauth: {
      type: DataTypes.JSON,
      allowNull: true
    }
  })

  const [dbRedisSetting] = await redisSetting.findAll()
  const [dbServerSetting] = await serverSetting.findAll()
  const [dbGameServerSetting] = await gameServerSetting.findAll()
  let [dbAuthenticationSetting] = await authenticationSetting.findAll()

  const dbRedis = {
    port: dbRedisSetting.port,
    address: dbRedisSetting.address,
    enabled: dbRedisSetting.enabled,
    password: dbRedisSetting.password
  }

  const dbServer = {
    paginate: { default: 10, max: dbServerSetting.paginate },
    publicDir: dbServerSetting.publicDir
  }

  const dbGameServer = {
    mode: dbGameServerSetting.mode,
    enabled: dbGameServerSetting.enabled,
    clientHost: dbGameServerSetting.clientHost
  }

  const dbAuthentication = {
    id: dbAuthenticationSetting.id,
    service: dbAuthenticationSetting.service,
    entity: dbAuthenticationSetting.entity,
    secret: dbAuthenticationSetting.secret,
    authStrategies: JSON.parse(JSON.parse(dbAuthenticationSetting.authStrategies)),
    local: JSON.parse(JSON.parse(dbAuthenticationSetting.local)),
    jwtOptions: JSON.parse(JSON.parse(dbAuthenticationSetting.jwtOptions)),
    bearerToken: JSON.parse(JSON.parse(dbAuthenticationSetting.bearerToken)),
    callback: JSON.parse(JSON.parse(dbAuthenticationSetting.callback)),
    oauth: {
      ...JSON.parse(JSON.parse(dbAuthenticationSetting.oauth)),
      defaults: JSON.parse(JSON.parse(JSON.parse(dbAuthenticationSetting.oauth)).defaults),
      facebook: JSON.parse(JSON.parse(JSON.parse(dbAuthenticationSetting.oauth)).facebook),
      github: JSON.parse(JSON.parse(JSON.parse(dbAuthenticationSetting.oauth)).github),
      google: JSON.parse(JSON.parse(JSON.parse(dbAuthenticationSetting.oauth)).google),
      linkedin: JSON.parse(JSON.parse(JSON.parse(dbAuthenticationSetting.oauth)).linkedin),
      twitter: JSON.parse(JSON.parse(JSON.parse(dbAuthenticationSetting.oauth)).twitter)
    }
  }

  // convert array of objects to array of string
  if (dbAuthentication) {
    let authObj = dbAuthentication.authStrategies.reduce((obj, item) => Object.assign(obj, { ...item }), {})
    dbAuthentication.authStrategies = Object.keys(authObj)
      .map((key) => (authObj[key] && key !== 'emailMagicLink' && key !== 'smsMagicLink' ? key : null))
      .filter(Boolean)
  }

  const redisConfig = dbRedis || config.redis
  const serverConfig = dbServer || config.server
  const gameServerConfig = dbGameServer || config.gameserver
  const authenticationConfig = dbAuthentication || config.authentication

  if (gameServerConfig.enabled) {
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

      app.set('paginate', serverConfig.paginate)
      app.set('authentication', authenticationConfig)

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
      app.use(favicon(path.join(serverConfig.publicDir, 'favicon.ico')))

      // Set up Plugins and providers
      app.configure(rest())
      app.configure(
        socketio(
          {
            serveClient: false,
            pingTimeout: process.env.APP_ENV === 'development' ? 1200000 : 20000,
            cors: {
              origin: [
                'https://' + gameServerConfig.clientHost,
                'capacitor://' + gameServerConfig.clientHost,
                'ionic://' + gameServerConfig.clientHost
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

      if (redisConfig.enabled) {
        app.configure(
          sync({
            uri:
              redisConfig.password != null && redisConfig.password !== ''
                ? `redis://${redisConfig.address}:${redisConfig.port}?password=${redisConfig.password}`
                : `redis://${redisConfig.address}:${redisConfig.port}`
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

      if (gameServerConfig.mode === 'realtime') {
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

      if (config.kubernetes.enabled || process.env.APP_ENV === 'development' || gameServerConfig.mode === 'local') {
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

  /**
   * When using local dev, to properly test multiple worlds for portals we
   * need to programatically shut down and restart the gameserver process.
   */
  if (isDev && !config.kubernetes.enabled) {
    app.restart = () => {
      require('child_process').spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      process.exit(0)
    }
  }

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
