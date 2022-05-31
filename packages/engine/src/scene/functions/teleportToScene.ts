import { Euler } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { unloadScene } from '../../ecs/functions/EngineFunctions'
import { unloadSystems } from '../../ecs/functions/SystemFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'

export const teleportToScene = async () => {
  const world = Engine.instance.currentWorld

  // trigger hyperspace effect by simply adding tag component to the world's entity
  addComponent(world.worldEntity, HyperspaceTagComponent, {})

  // remove this scene's injected systems
  unloadSystems(world, true)

  // remove all entities that don't have PersistTags
  await unloadScene(world)

  // wait until the world has been joined
  await new Promise((resolve) => {
    matchActionOnce(EngineActions.joinedWorld.matches, resolve)
  })

  // teleport player to where the portal is
  const transform = getComponent(world.localClientEntity, TransformComponent)
  transform.position.copy(world.activePortal.remoteSpawnPosition)
  transform.rotation.setFromEuler(new Euler(0, world.activePortal.remoteSpawnEuler.y, 0, 'XYZ'))
}
