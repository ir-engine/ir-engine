import type { AuthenticationClient } from '@feathersjs/authentication-client'
import feathers from '@feathersjs/client'
import type { FeathersApplication } from '@feathersjs/feathers'
import type SocketIO from 'socket.io'
import io from 'socket.io-client'

import type { ServiceTypes } from '@xrengine/common/declarations'

import { serverHost } from './util/config'

type FeathersClient = FeathersApplication<ServiceTypes> &
  AuthenticationClient & {
    io: SocketIO.Server
    authentication: AuthenticationClient
  }

export class API {
  static instance: API

  static createAPI = () => {
    const feathersClient = feathers()

    const socket = io(serverHost, {
      withCredentials: true
    })
    feathersClient.configure(feathers.socketio(socket, { timeout: 10000 }))

    feathersClient.configure(
      feathers.authentication({
        storageKey: globalThis.process.env['VITE_FEATHERS_STORE_KEY']
      })
    )

    API.instance = new API()
    API.instance.client = feathersClient
  }

  client: FeathersClient
}

globalThis.API = API
