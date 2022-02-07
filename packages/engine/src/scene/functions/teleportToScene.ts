import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { unloadScene } from '../../ecs/functions/EngineFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'
import { unloadSystems } from '../../ecs/functions/SystemFunctions'
import { HyperspaceTagComponent } from '../components/HyperspaceTagComponent'
import { NetworkActionReceptors } from '../../networking/functions/NetworkActionReceptors'
import { Euler } from 'three'

export const teleportToScene = async () => {
  const world = useWorld()
  console.log('teleportToScene', world.activePortal)
  Engine.hasJoinedWorld = false

  // trigger hyperspace effect by simply adding tag component to the world's entity
  addComponent(world.worldEntity, HyperspaceTagComponent, {})

  // remove all network clients but own (will be updated when new connection is established)
  NetworkActionReceptors.removeAllNetworkClients(world, false)

  // remove this scene's injected systems
  unloadSystems(world, true)

  // remove all entities that don't have PersistTags
  await unloadScene(world)

  // wait until the world has been joined
  await new Promise((resolve) => {
    receiveActionOnce(EngineEvents.EVENTS.JOINED_WORLD, resolve)
  })

  // teleport player to where the portal is
  const transform = getComponent(world.localClientEntity, TransformComponent)
  transform.position.copy(world.activePortal.remoteSpawnPosition)
  transform.rotation.setFromEuler(new Euler(0, world.activePortal.remoteSpawnEuler.y, 0, 'XYZ'))
}
