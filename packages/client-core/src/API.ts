import type { AuthenticationClient } from '@feathersjs/authentication-client'
import authentication from '@feathersjs/authentication-client'
import feathers from '@feathersjs/client'
import type { FeathersApplication } from '@feathersjs/feathers'
import Primus from 'primus-client'

import type { ServiceTypes } from '@etherealengine/common/declarations'
import config from '@etherealengine/common/src/config'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

import primusClient from './util/primus-client'

type FeathersClient = FeathersApplication<ServiceTypes> &
  AuthenticationClient & {
    primus: Primus
    authentication: AuthenticationClient
  }

/**@deprecated - use 'Engine.instance.api' instead */
export class API {
  /**@deprecated - use 'Engine.instance.api' instead */
  static instance: API
  client: FeathersClient

  static createAPI = () => {
    const feathersClient = feathers()

    const primus = new Primus(config.client.serverUrl, {
      withCredentials: true
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

    Engine.instance.api = feathersClient
  }
}

globalThis.API = API
