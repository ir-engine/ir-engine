import { Engine } from '../ecs/classes/Engine'
import { initSystems, SystemModuleType } from '../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import IncomingNetworkSystem from './systems/IncomingNetworkSystem'
import MediaStreamSystem from './systems/MediaStreamSystem'
import OutgoingNetworkSystem from './systems/OutgoingNetworkSystem'
import WorldNetworkActionSystem from './systems/WorldNetworkActionSystem'

export function RealtimeNetworkingModule(media = true, pose = true) {
  const systemsToLoad: SystemModuleType<any>[] = []

  systemsToLoad.push({
    uuid: 'xre.engine.WorldNetworkActionSystem',
    type: SystemUpdateType.FIXED_EARLY,
    systemLoader: () => Promise.resolve({ default: WorldNetworkActionSystem })
  })

  if (media) {
    systemsToLoad.push({
      uuid: 'xre.engine.MediaStreamSystem',
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: MediaStreamSystem })
    })
  }

  if (pose) {
    systemsToLoad.push(
      {
        uuid: 'xre.engine.IncomingNetworkSystem',
        type: SystemUpdateType.FIXED_EARLY,
        systemLoader: () => Promise.resolve({ default: IncomingNetworkSystem })
      },
      {
        uuid: 'xre.engine.OutgoingNetworkSystem',
        type: SystemUpdateType.POST_RENDER,
        systemLoader: () => Promise.resolve({ default: OutgoingNetworkSystem })
      }
    )
  }

  return initSystems(Engine.instance.currentWorld, systemsToLoad)
}
