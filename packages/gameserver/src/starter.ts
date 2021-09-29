import { WebRTCGameServer } from './WebRTCGameServer'
import { start } from './start'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

WebRTCGameServer.options.systems!.push({
  type: SystemUpdateType.FIXED,
  systemModulePromise: import('@xrengine/client/src/pages/starter/StarterGameSystem')
})

start()
