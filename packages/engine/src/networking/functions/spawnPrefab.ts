import { addComponent, createEntity } from '../../ecs/functions/EntityFunctions'
import { SpawnNetworkObjectComponent } from '../../scene/components/SpawnNetworkObjectComponent'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export const spawnPrefab = (prefabType: number, uniqueId: string, networkId: number, parameters = {}) => {
  const entity = createEntity()
  console.log('spawnPrefab', prefabType, uniqueId, networkId, parameters)
  addComponent(entity, Network.instance.schema.prefabs.get(prefabType), {})
  addComponent(entity, NetworkObjectComponent, { networkId, uniqueId, snapShotTime: 0 })
  Network.instance.networkObjects[networkId] = {
    prefabType,
    entity,
    uniqueId,
    parameters
  }
  addComponent(entity, SpawnNetworkObjectComponent, { uniqueId, networkId, parameters })
  return entity
}
