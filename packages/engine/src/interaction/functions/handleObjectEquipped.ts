import { Entity } from '../../ecs/classes/Entity'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectEditInterface } from '../../networking/interfaces/WorldState'
import { EquippedStateUpdateSchema } from '../enums/EquippedEnums'
import { equipEntity, unequipEntity } from './equippableFunctions'

export const handleObjectEquipped = (editObject: NetworkObjectEditInterface): void => {
  const [isEquipped, equippedEntityId] = editObject.values as EquippedStateUpdateSchema

  if (!Network.instance.networkObjects[editObject.networkId])
    return console.warn(
      `Equipper entity with id ${editObject.networkId} does not exist! You should probably reconnect...`
    )

  const entityEquipper: Entity = Network.instance.networkObjects[editObject.networkId].entity

  if (isEquipped) {
    // we only care about equipping if we are the user doing so, otherwise network transforms take care of it
    if (!Network.instance.networkObjects[equippedEntityId])
      return console.warn(
        `Equipped entity with id ${equippedEntityId} does not exist! You should probably reconnect...`
      )
    // if(Network.instance.localAvatarNetworkId !== editObject.networkId) return;
    const entityEquipped = Network.instance.networkObjects[equippedEntityId].entity
    equipEntity(entityEquipper, entityEquipped)
  } else {
    unequipEntity(entityEquipper)
  }
}
