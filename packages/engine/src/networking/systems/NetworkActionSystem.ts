import { World } from '../../ecs/classes/World'
import { WorldNetworkActionReceptor } from '../functions/WorldNetworkActionReceptor'

export default async function NetworkActionSystem(world: World) {
  const worldNetworkQueues = WorldNetworkActionReceptor.createNetworkActionReceptor(world)
  return () => {
    worldNetworkQueues()
  }
}
