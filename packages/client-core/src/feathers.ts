import feathers from '@feathersjs/client'
import type { FeathersApplication } from '@feathersjs/feathers'
import type SocketIO from 'socket.io'
import io from 'socket.io-client'

import type { ServiceTypes } from '@xrengine/common/declarations'

import { serverHost } from './util/config'

const feathersClient = feathers() as FeathersApplication<ServiceTypes> & {
  io: SocketIO.Server
  authentication?: {
    authenticated: boolean
  }
}

const socket = io(serverHost, {
  withCredentials: true
})
feathersClient.configure(feathers.socketio(socket, { timeout: 10000 }))
feathersClient.configure(
  feathers.authentication({
    storageKey: globalThis.process.env['VITE_FEATHERS_STORE_KEY']
  })
)

export const client = feathersClient
