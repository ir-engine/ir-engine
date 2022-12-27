import type { AuthenticationClient } from '@feathersjs/authentication-client'
import authentication from '@feathersjs/authentication-client'
import feathers from '@feathersjs/client'
import type { FeathersApplication } from '@feathersjs/feathers'
import Primus from 'primus-client'

import type { ServiceTypes } from '@xrengine/common/declarations'
import config from '@xrengine/common/src/config'

import primusClient from './util/primus-client'

type FeathersClient = FeathersApplication<ServiceTypes> &
  AuthenticationClient & {
    primus: Primus
    authentication: AuthenticationClient
  }

export class API {
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

    API.instance = new API()
    API.instance.client = feathersClient as any
  }
}

globalThis.API = API
