import io from 'socket.io-client'
import feathers from '@feathersjs/client'
import { Config } from '@standardcreative/common/src/config'

const feathersStoreKey: string = Config.publicRuntimeConfig.feathersStoreKey
// TODO: offlineMode flag not working correctly
const feathersClient: any = !Config.publicRuntimeConfig.offlineMode ? feathers() : undefined

if (!Config.publicRuntimeConfig.offlineMode) {
  const socket = io(Config.publicRuntimeConfig.apiServer, {
    withCredentials: true
  })
  feathersClient.configure(feathers.socketio(socket, { timeout: 10000 }))
  feathersClient.configure(
    feathers.authentication({
      storageKey: feathersStoreKey
    })
  )
}

export const client = feathersClient
