import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'

import ServerHostNetworkSystem from './ServerHostNetworkSystem'

export function WorldHostModule() {
  return [
    {
      uuid: 'ee.instanceserver.ServerHostNetworkSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => Promise.resolve({ default: ServerHostNetworkSystem })
    }
  ]
}
