import io from 'socket.io-client'
import type { FeathersApplication } from '@feathersjs/feathers'
import feathers from '@feathersjs/client'
import type { ServiceTypes } from '@xrengine/common/declarations'

const feathersClient = feathers() // as FeathersApplication<ServiceTypes>
const serverHost =
  process.env.APP_ENV === 'development' || process.env['VITE_LOCAL_BUILD'] === 'true'
    ? `https://${(globalThis as any).process.env['VITE_SERVER_HOST']}:${
        (globalThis as any).process.env['VITE_SERVER_PORT']
      }`
    : `https://${(globalThis as any).process.env['VITE_SERVER_HOST']}`

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
