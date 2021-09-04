import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { NetworkObjectOwnerComponent } from '../components/NetworkObjectOwnerComponent'

export const getOwnerEntity = (entity: Entity): Entity => {
  if (hasComponent(entity, NetworkObjectOwnerComponent)) {
    return Network.instance.networkObjects[getComponent(entity, NetworkObjectOwnerComponent).networkId]?.entity
  }
}
