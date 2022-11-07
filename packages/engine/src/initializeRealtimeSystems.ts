import { Engine } from './ecs/classes/Engine'
import { initSystems, SystemModuleType } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import IncomingNetworkSystem from './networking/systems/IncomingNetworkSystem'
import MediaStreamSystem from './networking/systems/MediaStreamSystem'
import OutgoingNetworkSystem from './networking/systems/OutgoingNetworkSystem'
import WorldNetworkActionSystem from './networking/systems/WorldNetworkActionSystem'

export const initializeRealtimeSystems = async (media = true, pose = true) => {
  const systemsToLoad: SystemModuleType<any>[] = []

  systemsToLoad.push({
    uuid: 'xre.engine.WorldNetworkActionSystem',
    type: SystemUpdateType.FIXED_EARLY,
    systemLoader: () => Promise.resolve({ default: WorldNetworkActionSystem })
  })

  if (media) {
    systemsToLoad.push({
      uuid: 'xre.engine.MediaStreamSystem',
      type: SystemUpdateType.UPDATE,
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
        type: SystemUpdateType.FIXED_LATE,
        systemLoader: () => Promise.resolve({ default: OutgoingNetworkSystem })
      }
    )
  }

  await initSystems(Engine.instance.currentWorld, systemsToLoad)
}
