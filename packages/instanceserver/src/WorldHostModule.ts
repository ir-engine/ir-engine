import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'

import ServerHostNetworkSystem from './ServerHostNetworkSystem'
import ServerRecordingSystem from './ServerRecordingSystem'

export function WorldHostModule() {
  return [
    {
      uuid: 'ee.instanceserver.ServerHostNetworkSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => Promise.resolve({ default: ServerHostNetworkSystem })
    },
    {
      uuid: 'ee.instanceserver.ServerRecordingSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: ServerRecordingSystem })
    }
  ]
}
