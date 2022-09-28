import type { AuthenticationClient } from '@feathersjs/authentication-client'
import authentication from '@feathersjs/authentication-client'
import feathers from '@feathersjs/client'
import type { FeathersApplication } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import type SocketIO from 'socket.io'
import io from 'socket.io-client'

import type { ServiceTypes } from '@xrengine/common/declarations'
import { serverHost } from '@xrengine/common/src/config'

type FeathersClient = FeathersApplication<ServiceTypes> &
  AuthenticationClient & {
    io: SocketIO.Server
    authentication: AuthenticationClient
  }

export class API {
  static instance: API
  client: FeathersClient

  static createAPI = () => {
    const feathersClient = feathers()

    const socket = io(serverHost, {
      withCredentials: true
    })
    feathersClient.configure(socketio(socket, { timeout: 10000 }))

    feathersClient.configure(
      authentication({
        storageKey: globalThis.process.env['VITE_FEATHERS_STORE_KEY']
      })
    )

    API.instance = new API()
    API.instance.client = feathersClient as any
  }
}

globalThis.API = API
