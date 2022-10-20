import { getGLTFLoader } from './assets/classes/AssetLoader'
import { initializeKTX2Loader } from './assets/functions/createGLTFLoader'
import AvatarSpawnSystem from './avatar/AvatarSpawnSystem'
import AvatarSystem from './avatar/AvatarSystem'
import { isClient } from './common/functions/isClient'
import { Engine } from './ecs/classes/Engine'
import { initSystems, SystemModuleType } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import PhysicsSystem from './physics/systems/PhysicsSystem'
import TriggerSystem from './scene/systems/TriggerSystem'

/**
 * everything needed for rendering 3d scenes
 */

export const initializeSceneSystems = async () => {
  const world = Engine.instance.currentWorld

  const systemsToLoad: SystemModuleType<any>[] = []

  systemsToLoad.push(
    {
      uuid: 'xre.engine.AvatarSpawnSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => Promise.resolve({ default: AvatarSpawnSystem })
    },
    {
      uuid: 'xre.engine.AvatarSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => Promise.resolve({ default: AvatarSystem })
    },
    /** @todo fix equippable implementation */
    // {
    //   uuid: 'xre.engine.EquippableSystem',
    //   type: SystemUpdateType.FIXED_LATE,
    //   systemLoader: () => Promise.resolve({ EquippableSystem })
    // },
    {
      uuid: 'xre.engine.PhysicsSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: PhysicsSystem })
    },
    {
      uuid: 'xre.engine.TriggerSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: TriggerSystem })
    }
  )
  if (isClient) {
    systemsToLoad.push(...(await import('./initializeSceneClientSystems')).default())

    // todo: figure out the race condition that is stopping us from moving this to SceneObjectSystem
    initializeKTX2Loader(getGLTFLoader())
  }

  await initSystems(world, systemsToLoad)
}
