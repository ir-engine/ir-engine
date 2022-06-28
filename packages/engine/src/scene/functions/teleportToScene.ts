import { Euler } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'

export const teleportToScene = async () => {
  const world = Engine.instance.currentWorld

  // trigger hyperspace effect by simply adding tag component to the world's entity
  addComponent(world.worldEntity, HyperspaceTagComponent, {})

  // wait until the world has been joined
  await new Promise((resolve) => {
    matchActionOnce(EngineActions.joinedWorld.matches, resolve)
  })

  // teleport player to where the portal is
  const transform = getComponent(world.localClientEntity, TransformComponent)
  transform.position.copy(world.activePortal.remoteSpawnPosition)
  transform.rotation.setFromEuler(new Euler(0, world.activePortal.remoteSpawnEuler.y, 0, 'XYZ'))
}
