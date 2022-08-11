import { dispatchAction } from '@xrengine/hyperflux'

import { ParityValue } from '../../common/enums/ParityValue'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'

export const equipEntity = (
  equipperEntity: Entity,
  equippedEntity: Entity,
  attachmentPoint: EquippableAttachmentPoint = EquippableAttachmentPoint.RIGHT_HAND
): void => {
  if (!hasComponent(equipperEntity, EquipperComponent) && !hasComponent(equippedEntity, EquippedComponent)) {
    const networkComponent = getComponent(equippedEntity, NetworkObjectComponent)
    if (networkComponent.authorityUserId === Engine.instance.userId) {
      dispatchAction(
        WorldNetworkAction.setEquippedObject({
          object: {
            networkId: networkComponent.networkId,
            ownerId: networkComponent.ownerId
          },
          equip: true,
          attachmentPoint
        })
      )
    } else {
      dispatchAction(
        WorldNetworkAction.requestAuthorityOverObject({
          networkId: networkComponent.networkId,
          ownerId: networkComponent.ownerId,
          newAuthority: Engine.instance.userId,
          $to: networkComponent.authorityUserId
        })
      )
    }
  }
}

export const unequipEntity = (equipperEntity: Entity): void => {
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  if (!equipperComponent) return
  removeComponent(equipperEntity, EquipperComponent)
  const networkComponent = getComponent(equipperComponent.equippedEntity, NetworkObjectComponent)
  const networkOwnerComponent = getComponent(equipperComponent.equippedEntity, NetworkObjectOwnedTag)
  if (networkComponent.authorityUserId === Engine.instance.userId) {
    dispatchAction(
      WorldNetworkAction.setEquippedObject({
        object: {
          networkId: networkComponent.networkId,
          ownerId: networkComponent.ownerId
        },
        equip: false,
        attachmentPoint: null!
      })
    )
  } else {
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        networkId: networkComponent.networkId,
        ownerId: networkComponent.ownerId,
        newAuthority: networkComponent.authorityUserId
      })
    )
  }
}

export const changeHand = (equipperEntity: Entity, attachmentPoint: EquippableAttachmentPoint): void => {
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  if (equipperComponent) {
    const equippedEntity = equipperComponent.equippedEntity
    const equippedComponent = getComponent(equippedEntity, EquippedComponent)
    equippedComponent.attachmentPoint = attachmentPoint
  } else {
    console.warn(`changeHand for equippable called on entity with id ${equipperEntity} without equipperComponent!.`)
  }
}

export const getAttachmentPoint = (parityValue: ParityValue): EquippableAttachmentPoint => {
  let attachmentPoint = EquippableAttachmentPoint.RIGHT_HAND
  if (parityValue === ParityValue.LEFT) attachmentPoint = EquippableAttachmentPoint.LEFT_HAND

  return attachmentPoint
}

export const getParity = (attachmentPoint: EquippableAttachmentPoint): ParityValue => {
  let parityValue = ParityValue.RIGHT
  if (attachmentPoint === EquippableAttachmentPoint.LEFT_HAND) parityValue = ParityValue.LEFT

  return parityValue
}
