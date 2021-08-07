import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { SpawnNetworkObjectComponent } from '../../scene/components/SpawnNetworkObjectComponent'
import { Network } from '../classes/Network'
import { NetworkObject } from '../components/NetworkObject'

export const spawnPrefab = (
  prefabType: number,
  ownerId: string,
  uniqueId: string,
  networkId: number,
  parameters = {}
) => {
  const entity = createEntity()
  console.log('spawnPrefab', prefabType, ownerId, uniqueId, networkId, parameters)
  addComponent(entity, Network.instance.schema.prefabs.get(prefabType))
  Network.instance.networkObjects[networkId] = {
    ownerId,
    prefabType,
    component: addComponent(entity, NetworkObject, { ownerId, networkId, uniqueId }),
    uniqueId,
    parameters
  }
  addComponent(entity, SpawnNetworkObjectComponent, { ownerId, uniqueId, networkId, parameters })
  return entity
}
