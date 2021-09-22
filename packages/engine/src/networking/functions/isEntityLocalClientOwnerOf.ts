import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { NetworkObjectOwnerComponent } from '../components/NetworkObjectOwnerComponent'

export const isEntityLocalClientOwnerOf = (entity: Entity): boolean => {
  if (typeof useWorld().localClientEntity !== 'undefined' && hasComponent(entity, NetworkObjectOwnerComponent)) {
    return (
      Network.instance.objects[getComponent(entity, NetworkObjectOwnerComponent).networkId]?.entity ===
      useWorld().localClientEntity
    )
  }
}
