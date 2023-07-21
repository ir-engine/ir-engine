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

import { RigidBodyType } from '@dimforge/rapier3d-compat'
import React, { useEffect } from 'react'
import { MeshBasicMaterial, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import {
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  receiveActions,
  useHookstate
} from '@etherealengine/hyperflux'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { isClient } from '../../common/functions/getEnvironment'
import { matches, matchesEntityUUID } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { NetworkTopics } from '../../networking/classes/Network'
import { NetworkObjectAuthorityTag, NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponents'
import { GrabbableComponent, GrabbedComponent, GrabberComponent } from '../components/GrabbableComponent'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI, InteractableTransitions, removeInteractiveUI } from './InteractiveSystem'

export class GrabbableNetworkAction {
  static setGrabbedObject = defineAction({
    type: 'ee.engine.grabbable.SET_GRABBED_OBJECT',
    entityUUID: matchesEntityUUID,
    grabbed: matches.boolean,
    attachmentPoint: matches.literals('left', 'right', 'none').optional(),
    grabberUserId: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })
}

export const GrabbableState = defineState({
  name: 'ee.engine.grabbables.GrabbableState',

  initial: {} as Record<
    EntityUUID,
    {
      attachmentPoint: 'left' | 'right' | 'none'
      grabberUserId: EntityUUID
    }
  >,

  receptors: [
    [
      GrabbableNetworkAction.setGrabbedObject,
      (state, action: typeof GrabbableNetworkAction.setGrabbedObject.matches._TYPE) => {
        if (action.grabbed)
          state[action.entityUUID].set({
            attachmentPoint: action.attachmentPoint ?? 'right',
            grabberUserId: action.grabberUserId
          })
        else state[action.entityUUID].set(none)
      }
    ]
  ]
})

const GrabbableReactor = React.memo(({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(GrabbableState)[entityUUID])
  const entity = UUIDComponent.entitiesByUUID[entityUUID]
  const grabberEntity = UUIDComponent.entitiesByUUID[state.grabberUserId.value as EntityUUID]
  const attachmentPoint = state.attachmentPoint.value

  useEffect(() => {
    setComponent(grabberEntity, GrabberComponent, { grabbedEntity: entity })
    setComponent(entity, GrabbedComponent, {
      grabberEntity,
      attachmentPoint
    })

    const body = getComponent(entity, RigidBodyComponent)?.body
    if (body) {
      Physics.changeRigidbodyType(entity, RigidBodyType.KinematicPositionBased)
      for (let i = 0; i < body.numColliders(); i++) {
        const collider = body.collider(i)
        let oldCollisionGroups = collider.collisionGroups()
        oldCollisionGroups ^= CollisionGroups.Default << 16
        collider.setCollisionGroups(oldCollisionGroups)
      }
    }

    return () => {
      removeComponent(entity, GrabbedComponent)
      setComponent(grabberEntity, GrabberComponent, { grabbedEntity: null })
      if (body) {
        Physics.changeRigidbodyType(entity, RigidBodyType.Dynamic)
        for (let i = 0; i < body.numColliders(); i++) {
          const collider = body.collider(i)
          let oldCollisionGroups = collider.collisionGroups()
          oldCollisionGroups ^= CollisionGroups.Default << 16
          collider.setCollisionGroups(oldCollisionGroups)
        }
      }
    }
  }, [])

  return null
})

export const GrabbablesReactor = React.memo(() => {
  const grabbableState = useHookstate(getMutableState(GrabbableState))
  return (
    <>
      {grabbableState.keys.map((entityUUID: EntityUUID) => (
        <GrabbableReactor key={entityUUID} entityUUID={entityUUID} />
      ))}
    </>
  )
})

/** @deprecated @todo - replace with reactor */
export function transferAuthorityOfObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.transferAuthorityOfObject>
) {
  if (action.newAuthority !== Engine.instance.peerID) return
  const grabbableEntity = Engine.instance.getNetworkObject(action.ownerId, action.networkId)!
  if (hasComponent(grabbableEntity, GrabbableComponent)) {
    const grabberUserId = Engine.instance.worldNetwork.peers.get(action.newAuthority)?.userId!
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(grabbableEntity, UUIDComponent),
        grabberUserId: grabberUserId as any as EntityUUID,
        grabbed: !hasComponent(grabbableEntity, GrabbedComponent),
        // todo, pass attachment point through actions somehow
        attachmentPoint: 'right'
      })
    )
  }
}

// since grabbables are all client authoritative, we don't need to recompute this for all users
export function grabberQueryAll(grabberEntity: Entity) {
  const grabberComponent = getComponent(grabberEntity, GrabberComponent)
  const grabbedEntity = grabberComponent.grabbedEntity
  if (!grabbedEntity) return

  const grabberAuthority = hasComponent(grabberEntity, NetworkObjectAuthorityTag)
  if (!grabberAuthority) return

  const grabbedComponent = getComponent(grabbedEntity, GrabbedComponent)
  const attachmentPoint = grabbedComponent.attachmentPoint

  const target = getHandTarget(grabberEntity, attachmentPoint ?? 'right')!

  const rigidbodyComponent = getComponent(grabbedEntity, RigidBodyComponent)

  if (rigidbodyComponent) {
    rigidbodyComponent.targetKinematicPosition.copy(target.position)
    rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
    rigidbodyComponent.body.setTranslation(target.position, true)
    rigidbodyComponent.body.setRotation(target.rotation, true)
  }

  const grabbableTransform = getComponent(grabbedEntity, TransformComponent)
  grabbableTransform.position.copy(target.position)
  grabbableTransform.rotation.copy(target.rotation)
}

const vec3 = new Vector3()

export const onGrabbableInteractUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  const transform = getComponent(xrui.entity, TransformComponent)
  if (!transform || !hasComponent(Engine.instance.localClientEntity, TransformComponent)) return
  transform.position.copy(getComponent(entity, TransformComponent).position)

  if (hasComponent(xrui.entity, VisibleComponent)) {
    const boundingBox = getComponent(entity, BoundingBoxComponent)
    if (boundingBox) {
      const boundingBoxHeight = boundingBox.box.max.y - boundingBox.box.min.y
      transform.position.y += boundingBoxHeight * 2
    } else {
      transform.position.y += 0.5
    }
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    transform.rotation.copy(cameraTransform.rotation)
  }

  const transition = InteractableTransitions.get(entity)!
  const isGrabbed = hasComponent(entity, GrabbedComponent)
  if (isGrabbed) {
    if (transition.state === 'IN') {
      transition.setState('OUT')
      removeComponent(xrui.entity, VisibleComponent)
    }
  } else {
    getAvatarBoneWorldPosition(Engine.instance.localClientEntity, 'Hips', vec3)
    const distance = vec3.distanceToSquared(transform.position)
    const inRange = distance < 5
    if (transition.state === 'OUT' && inRange) {
      transition.setState('IN')
      setComponent(xrui.entity, VisibleComponent)
    }
    if (transition.state === 'IN' && !inRange) {
      transition.setState('OUT')
    }
  }
  transition.update(Engine.instance.deltaSeconds, (opacity) => {
    if (opacity === 0) {
      removeComponent(xrui.entity, VisibleComponent)
    }
    xrui.container.rootLayer.traverseLayersPreOrder((layer) => {
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

export const grabEntity = (grabberEntity: Entity, grabbedEntity: Entity, attachmentPoint: XRHandedness): void => {
  const networkComponent = getComponent(grabbedEntity, NetworkObjectComponent)
  if (networkComponent.authorityPeerID === Engine.instance.peerID) {
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
        networkId: networkComponent.networkId,
        ownerId: networkComponent.ownerId,
        newAuthority: Engine.instance.peerID,
        $to: Engine.instance.worldNetwork.peers.get(networkComponent.authorityPeerID)?.userId
      })
    )
  }
}

export const dropEntity = (grabberEntity: Entity): void => {
  const grabberComponent = getComponent(grabberEntity, GrabberComponent)
  if (!grabberComponent) return
  const grabbedEntity = grabberComponent.grabbedEntity!
  if (!grabbedEntity) return
  const networkComponent = getComponent(grabbedEntity, NetworkObjectComponent)
  if (networkComponent.authorityPeerID === Engine.instance.peerID) {
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
        networkId: networkComponent.networkId,
        ownerId: networkComponent.ownerId,
        newAuthority: networkComponent.authorityPeerID
      })
    )
  }
}

/**
 * @todo refactor this into i18n and configurable
 */
export const grabbableInteractMessage = 'Grab'

const interactedActionQueue = defineActionQueue(EngineActions.interactedWithObject.matches)
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)

const grabberQuery = defineQuery([GrabberComponent])
const grabbableQuery = defineQuery([GrabbableComponent])

const onDrop = () => {
  const grabber = getComponent(Engine.instance.localClientEntity, GrabberComponent)
  if (!grabber?.grabbedEntity) return
  dropEntity(Engine.instance.localClientEntity)
}

const onGrab = (targetEntity: Entity, handedness = 'right' as XRHandedness) => {
  if (!hasComponent(targetEntity, GrabbableComponent)) return
  const grabber = getComponent(Engine.instance.localClientEntity, GrabberComponent)
  if (grabber?.grabbedEntity) {
    onDrop()
  } else {
    grabEntity(Engine.instance.localClientEntity, targetEntity, handedness)
  }
}

const execute = () => {
  if (getState(EngineState).isEditor) return
  receiveActions(GrabbableState)

  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSourceQuery()[0]
  if (nonCapturedInputSource) {
    const inputSource = getComponent(nonCapturedInputSource, InputSourceComponent)
    if (inputSource.buttons.KeyU?.down) onDrop()
    /** @todo currently mouse has to be over the grabbable for it to be grabbed */
    // if (inputSource.buttons.KeyE?.down) onGrab(inputSource.assignedButtonEntity)
  }

  for (const action of interactedActionQueue()) {
    if (action.targetEntity && hasComponent(action.targetEntity, GrabbableComponent)) {
      onGrab(action.targetEntity, action.handedness === 'none' ? 'right' : action.handedness)
    }
  }

  for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)

  /**
   * @todo use an XRUI pool
   */
  if (isClient)
    for (const entity of grabbableQuery.enter()) {
      addInteractableUI(entity, createInteractUI(entity, grabbableInteractMessage), onGrabbableInteractUpdate)
    }

  for (const entity of grabbableQuery.exit()) {
    removeInteractiveUI(entity)
  }

  for (const entity of grabberQuery()) {
    grabberQueryAll(entity)
  }
}

export const GrabbableSystem = defineSystem({
  uuid: 'ee.engine.GrabbableSystem',
  execute,
  reactor: GrabbablesReactor
})
