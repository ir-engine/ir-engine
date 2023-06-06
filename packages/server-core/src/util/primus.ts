import { socket } from '@feathersjs/transport-commons'
import http from 'http'
import Primus from 'primus'
import Emitter from 'primus-emitter'

import { PrimusType } from '../../declarations'

function configurePrimus(config?: any, configurer?: any) {
  return function (app) {
    // Returns the connection object
    const getParams = (spark) => spark.request.feathers
    // Mapping from connection back to its socket
    const socketMap = new WeakMap()

    if (!app.version || app.version < '3.0.0') {
      throw new Error(
        '@feathersjs/primus is not compatible with this version of Feathers. Use the latest at @feathersjs/feathers.'
      )
    }

    const done = new Promise((resolve) => {
      const { listen, setup } = app as any

      Object.assign(app, {
        async listen(this: any, ...args: any[]) {
          if (typeof listen === 'function') {
            // If `listen` already exists
            // usually the case when the app has been expressified
            return listen.call(this, ...args)
          }

          const server = http.createServer()

          await this.setup(server)

          return server.listen(...args)
        },

        async setup(this: any, server = http.createServer(), ...rest: any[]) {
          if (!this.primus) {
            const primus = (this.primus = new Primus(server, config)) as PrimusType

            primus.plugin('emitter', Emitter)

            primus.use(
              'feathers',
              function (req, res, next) {
                req.feathers = {
                  headers: Object.keys(req.headers).reduce((result, key) => {
                    const value = req.headers[key]

                    if (typeof value !== 'object') {
                      result[key] = value
                    }

                    return result
                  }, {}),
                  provider: 'primus'
                }

                next()
              },
              0
            )

            primus.on('connection', async (spark) => socketMap.set(getParams(spark), spark))
            primus.on('disconnection', (spark) => app.emit('disconnect', getParams(spark)))
          }

          if (typeof configurer === 'function') configurer.call(this, this.primus)

          resolve(this.primus)

          return setup.call(this, server, ...rest)
        }
      })
    })

    app.configure(
      socket({
        done,
        socketMap,
        getParams,
        emit: 'send'
      })
    )
  }
}

export default configurePrimus
