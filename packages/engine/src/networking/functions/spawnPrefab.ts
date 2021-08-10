import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { SpawnNetworkObjectComponent } from '../../scene/components/SpawnNetworkObjectComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export const spawnPrefab = (
  prefabType: number,
  ownerId: string,
  uniqueId: string,
  networkId: number,
  parameters = {}
) => {
  const entity = createEntity()
  console.log('spawnPrefab', prefabType, ownerId, uniqueId, networkId, parameters)
  addComponent(entity, Network.instance.schema.prefabs.get(prefabType), {})
  addComponent(entity, NetworkObjectComponent, { ownerId, networkId, uniqueId, snapShotTime: 0 })
  Network.instance.networkObjects[networkId] = {
    ownerId,
    prefabType,
    entity,
    uniqueId,
    parameters
  }
  addComponent(entity, SpawnNetworkObjectComponent, { ownerId, uniqueId, networkId, parameters })
  return entity
}
