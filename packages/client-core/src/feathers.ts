import feathers from '@feathersjs/client'
import io from 'socket.io-client'

// import type { Application } from '../../server-core/declarations'

const feathersClient = feathers() // as Application
const serverHost =
  process.env.APP_ENV === 'development'
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
