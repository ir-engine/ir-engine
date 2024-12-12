/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import type { AuthenticationClient } from '@feathersjs/authentication-client'
import authentication from '@feathersjs/authentication-client'
import feathers from '@feathersjs/client'
import type { FeathersApplication } from '@feathersjs/feathers'
import Primus from 'primus-client'

import { API as CommonAPI } from '@ir-engine/common'

import type { ServiceTypes } from '@ir-engine/common/declarations'
import config from '@ir-engine/common/src/config'

import { HyperFlux } from '@ir-engine/hyperflux'
import primusClient from './util/primus-client'

declare module '@feathersjs/client' {
  interface FeathersApplication extends AuthenticationClient {
    authentication: AuthenticationClient
  }
}

/**@deprecated - use '@ir-engine.common API.instance' instead */
export class API {
  /**@deprecated - use '@ir-engine.common API.instance' instead */
  static instance: API
  client: FeathersApplication<ServiceTypes>

  static createAPI = () => {
    const feathersClient = feathers()

    const query = {
      pathName: window.location.pathname,
      peerID: HyperFlux.store.peerID
    }

    const queryString = new URLSearchParams(query).toString()
    const primus = new Primus(`${config.client.serverUrl}?${queryString}`, {
      withCredentials: true,
      pingTimeout: config.websocket.pingTimeout,
      pingInterval: config.websocket.pingInterval
    })
    feathersClient.configure(primusClient(primus, { timeout: 10000 }))

    feathersClient.configure(
      authentication({
        storageKey: config.client.featherStoreKey
      })
    )

    primus.on('reconnected', () => API.instance.client.reAuthenticate(true))

    API.instance = new API()
    API.instance.client = feathersClient as any

    CommonAPI.instance = feathersClient

    const showLogs = false //isDev

    // add logging to API calls
    if (showLogs) {
      const methods = ['create', 'update', 'patch', 'remove', 'find', 'get']
      const originalService = feathersClient.service
      const originalMethods = {} as Record<string, Record<string, any>>

      feathersClient.service = (path: string) => {
        if (!originalMethods[path]) originalMethods[path] = {}
        const service = originalService.call(feathersClient, path)
        for (const method of methods) {
          if (!originalMethods[path][method]) {
            originalMethods[path][method] = service[method]
            const originalMethod = service[method]
            service[method] = async (...args: any) => {
              const trace = { stack: '' }
              Error.captureStackTrace?.(trace, service[method])
              const stack = trace.stack.split('\n')
              stack.shift()
              console.log(`API: ${path}.${method}`, ...args, { stack })
              return originalMethod.call(service, ...args)
            }
          }
        }
        return service
      }
    }
  }
}

globalThis.API = API
