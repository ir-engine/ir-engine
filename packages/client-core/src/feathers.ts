import io from 'socket.io-client'
import feathers from '@feathersjs/client'
import { Config } from '@xrengine/common/src/config'
// import { Application as FeathersApplication } from '@feathersjs/feathers/lib/declarations'
import type { Application } from '../../server-core/declarations'

const feathersStoreKey: string = Config.publicRuntimeConfig.feathersStoreKey
// TODO: offlineMode flag not working correctly
const feathersClient: Application = feathers()

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
