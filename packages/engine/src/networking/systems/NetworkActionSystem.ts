import { World } from '../../ecs/classes/World'
import { NetworkActionReceptor } from '../functions/NetworkActionReceptor'

export default async function IncomingNetworkSystem(world: World) {
  const networkQueues = NetworkActionReceptor.createNetworkActionReceptor(world)
  return () => {
    networkQueues()
  }
}
