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

import { Engine, Entity, getComponent, matchesEntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { defineAction, dispatchAction, getState, matches } from '@etherealengine/hyperflux'
import { NetworkObjectComponent, NetworkState, NetworkTopics, WorldNetworkAction } from '@etherealengine/network'
import { InputState } from '@etherealengine/spatial/src/input/state/InputState'

import { GrabberComponent } from '../components/GrabbableComponent'

export const grabbableInteractMessage = 'Grab'

export class GrabbableNetworkAction {
  static setGrabbedObject = defineAction({
    type: 'ee.engine.grabbable.SET_GRABBED_OBJECT',
    entityUUID: matchesEntityUUID,
    grabbed: matches.boolean,
    attachmentPoint: matches.literals('left', 'right').optional(),
    grabberUserId: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })
}

export const grabEntity = (grabberEntity: Entity, grabbedEntity: Entity, attachmentPoint: 'left' | 'right'): void => {
  // todo, do we ever need to handle this in offline contexts?
  if (!NetworkState.worldNetwork) return console.warn('[GrabbableSystem] no world network found')
  const networkComponent = getComponent(grabbedEntity, NetworkObjectComponent)
  if (networkComponent.authorityPeerID === Engine.instance.store.peerID) {
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(grabbedEntity, UUIDComponent),
        grabberUserId: getComponent(grabberEntity, UUIDComponent),
        grabbed: true,
        attachmentPoint
      })
    )
  } else {
    dispatchAction(
      WorldNetworkAction.requestAuthorityOverObject({
        entityUUID: getComponent(grabbedEntity, UUIDComponent),
        newAuthority: Engine.instance.store.peerID,
        $to: networkComponent.ownerPeer
      })
    )
  }
}
export const dropEntity = (grabberEntity: Entity): void => {
  const grabberComponent = getComponent(grabberEntity, GrabberComponent)
  if (!grabberComponent) return
  const handedness = getState(InputState).preferredHand
  const grabbedEntity = grabberComponent[handedness]!
  if (!grabbedEntity) return
  const networkComponent = getComponent(grabbedEntity, NetworkObjectComponent)
  if (networkComponent.authorityPeerID === Engine.instance.store.peerID) {
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(grabbedEntity, UUIDComponent),
        grabberUserId: getComponent(grabberEntity, UUIDComponent),
        grabbed: false
      })
    )
  } else {
    dispatchAction(
      WorldNetworkAction.transferAuthorityOfObject({
        ownerID: Engine.instance.userID,
        entityUUID: getComponent(grabbedEntity, UUIDComponent),
        newAuthority: networkComponent.authorityPeerID
      })
    )
  }
}
