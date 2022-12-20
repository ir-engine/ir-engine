import AvatarSpawnSystem from './avatar/AvatarSpawnSystem'
import AvatarSystem from './avatar/AvatarSystem'
import { isClient } from './common/functions/isClient'
import { Engine } from './ecs/classes/Engine'
import { initSystems, SystemModuleType } from './ecs/functions/SystemFunctions'
import { SystemUpdateType } from './ecs/functions/SystemUpdateType'
import PhysicsSystem from './physics/systems/PhysicsSystem'

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
    /** @todo fix equippable implementation #3947 */
    // {
    //   uuid: 'xre.engine.EquippableSystem',
    //   type: SystemUpdateType.FIXED_LATE,
    //   systemLoader: () => Promise.resolve({ EquippableSystem })
    // },
    {
      uuid: 'xre.engine.PhysicsSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: PhysicsSystem })
    }
  )
  if (isClient) {
    systemsToLoad.push(...(await import('./initializeSceneClientSystems')).default())
  }

  await initSystems(world, systemsToLoad)
}
