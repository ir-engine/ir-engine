import { dispatchAction } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity, attachmentPoint: XRHandedness): void => {
  if (!hasComponent(equipperEntity, EquipperComponent) && !hasComponent(equippedEntity, EquippedComponent)) {
    const networkComponent = getComponent(equippedEntity, NetworkObjectComponent)
    if (networkComponent.authorityPeerID === Engine.instance.currentWorld?.worldNetwork.peerID) {
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
          newAuthority: Engine.instance.currentWorld?.worldNetwork.peerID,
          $to: Engine.instance.currentWorld?.worldNetwork.peers.get(networkComponent.authorityPeerID)?.userId
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
  if (networkComponent.authorityPeerID === Engine.instance.currentWorld?.worldNetwork.peerID) {
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
        newAuthority: networkComponent.authorityPeerID
      })
    )
  }
}

export const changeHand = (equipperEntity: Entity, attachmentPoint: XRHandedness): void => {
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  if (equipperComponent) {
    const equippedEntity = equipperComponent.equippedEntity
    const equippedComponent = getComponent(equippedEntity, EquippedComponent)
    equippedComponent.attachmentPoint = attachmentPoint
  } else {
    console.warn(`changeHand for equippable called on entity with id ${equipperEntity} without equipperComponent!.`)
  }
}
