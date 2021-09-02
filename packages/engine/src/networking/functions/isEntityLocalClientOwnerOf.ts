import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { NetworkObjectOwnerComponent } from '../components/NetworkObjectOwnerComponent'

export const isEntityLocalClientOwnerOf = (entity: Entity): boolean => {
  if (typeof Network.instance.localClientEntity !== 'undefined' && hasComponent(entity, NetworkObjectOwnerComponent)) {
    return (
      Network.instance.networkObjects[getComponent(entity, NetworkObjectOwnerComponent).networkId]?.entity ===
      Network.instance.localClientEntity
    )
  }
}
