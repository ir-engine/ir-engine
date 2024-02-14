/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
