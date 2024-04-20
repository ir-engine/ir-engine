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
