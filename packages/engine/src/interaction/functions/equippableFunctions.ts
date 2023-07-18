/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { dispatchAction } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity, attachmentPoint: XRHandedness): void => {
  if (!hasComponent(equipperEntity, EquipperComponent) && !hasComponent(equippedEntity, EquippedComponent)) {
    const networkComponent = getComponent(equippedEntity, NetworkObjectComponent)
    if (networkComponent.authorityPeerID === Engine.instance.peerID) {
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
          newAuthority: Engine.instance.peerID,
          $to: Engine.instance.worldNetwork.peers.get(networkComponent.authorityPeerID)?.userId
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
  if (networkComponent.authorityPeerID === Engine.instance.peerID) {
    dispatchAction(
      WorldNetworkAction.setEquippedObject({
        object: {
          networkId: networkComponent.networkId,
          ownerId: networkComponent.ownerId
        },
        equip: false
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
