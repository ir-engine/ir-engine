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

import React, { useEffect } from 'react'
import { MeshBasicMaterial, Vector3 } from 'three'

import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import {
  defineAction,
  defineActionQueue,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  matches,
  none,
  useHookstate
} from '@etherealengine/hyperflux'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import {
  ECSState,
  Engine,
  Entity,
  SimulationSystemGroup,
  defineQuery,
  defineSystem,
  entityExists,
  getComponent,
  getOptionalComponent,
  hasComponent,
  matchesEntityUUID,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs'
import {
  NetworkObjectAuthorityTag,
  NetworkObjectComponent,
  NetworkState,
  NetworkTopics,
  WorldNetworkAction
} from '@etherealengine/network'
import { ClientInputSystem } from '@etherealengine/spatial'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '@etherealengine/spatial/src/input/state/ButtonState'
import { InputState } from '@etherealengine/spatial/src/input/state/InputState'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@etherealengine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { BoundingBoxComponent } from '@etherealengine/spatial/src/transform/components/BoundingBoxComponents'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { GrabbableComponent, GrabbedComponent, GrabberComponent } from '../components/GrabbableComponent'
import { createInteractUI } from '../functions/interactUI'
import {
  InteractableState,
  InteractableTransitions,
  addInteractableUI,
  removeInteractableUI
} from './InteractableSystem'

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

export const GrabbableState = defineState({
  name: 'ee.engine.grabbables.GrabbableState',

  initial: {} as Record<
    EntityUUID,
    {
      attachmentPoint: 'left' | 'right'
      grabberUserId: EntityUUID
    }
  >,

  receptors: {
    onSetGrabbedObject: GrabbableNetworkAction.setGrabbedObject.receive((action) => {
      const state = getMutableState(GrabbableState)
      if (action.grabbed)
        state[action.entityUUID].set({
          attachmentPoint: action.attachmentPoint ?? 'right',
          grabberUserId: action.grabberUserId
        })
      else state[action.entityUUID].set(none)
    }),
    onDestroyObject: WorldNetworkAction.destroyEntity.receive((action) => {
      const state = getMutableState(GrabbableState)
      state[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const grabbableState = useHookstate(getMutableState(GrabbableState))
    return (
      <>
        {grabbableState.keys.map((entityUUID: EntityUUID) => (
          <GrabbableReactor key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const GrabbableReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(GrabbableState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)
  const grabberEntity = UUIDComponent.useEntityByUUID(state.grabberUserId.value as EntityUUID)
  const attachmentPoint = state.attachmentPoint.value
  const bodyState = useComponent(entity, RigidBodyComponent)?.body

  useEffect(() => {
    if (!entity || !grabberEntity || !bodyState) return

    setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: entity })
    setComponent(entity, GrabbedComponent, {
      grabberEntity,
      attachmentPoint
    })

    const body = bodyState.value

    if (body) {
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Kinematic })
      for (let i = 0; i < body.numColliders(); i++) {
        const collider = body.collider(i)
        let oldCollisionGroups = collider.collisionGroups()
        oldCollisionGroups ^= CollisionGroups.Default << 16
        collider.setCollisionGroups(oldCollisionGroups)
      }
    }

    return () => {
      if (hasComponent(grabberEntity, GrabbedComponent))
        setComponent(grabberEntity, GrabberComponent, { [attachmentPoint]: null })
      if (!entityExists(entity)) return
      removeComponent(entity, GrabbedComponent)
      if (body) {
        setComponent(entity, RigidBodyComponent, { type: BodyTypes.Dynamic })
        for (let i = 0; i < body.numColliders(); i++) {
          const collider = body.collider(i)
          let oldCollisionGroups = collider.collisionGroups()
          oldCollisionGroups ^= CollisionGroups.Default << 16
          collider.setCollisionGroups(oldCollisionGroups)
        }
      }
    }
  }, [entity, grabberEntity, bodyState])

  return null
}

/** @deprecated @todo - replace with reactor */
export function transferAuthorityOfObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.transferAuthorityOfObject>
) {
  if (action.newAuthority !== Engine.instance.store.peerID) return
  const grabbableEntity = UUIDComponent.getEntityByUUID(action.entityUUID)
  if (hasComponent(grabbableEntity, GrabbableComponent)) {
    const grabberUserId = NetworkState.worldNetwork.peers[action.newAuthority]?.userId
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
export function grabbableQueryAll(grabbableEntity: Entity) {
  const grabbedComponent = getOptionalComponent(grabbableEntity, GrabbedComponent)
  if (!grabbedComponent) return
  const attachmentPoint = grabbedComponent.attachmentPoint

  const target = getHandTarget(grabbedComponent.grabberEntity, attachmentPoint ?? 'right')!

  const rigidbodyComponent = getOptionalComponent(grabbableEntity, RigidBodyComponent)

  if (rigidbodyComponent) {
    rigidbodyComponent.targetKinematicPosition.copy(target.position)
    rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
    rigidbodyComponent.body.setTranslation(target.position, true)
    rigidbodyComponent.body.setRotation(target.rotation, true)
  }

  const grabbableTransform = getComponent(grabbableEntity, TransformComponent)
  grabbableTransform.position.copy(target.position)
  grabbableTransform.rotation.copy(target.rotation)
}

const vec3 = new Vector3()

export const onGrabbableInteractUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  const xruiTransform = getComponent(xrui.entity, TransformComponent)
  if (!xruiTransform) return

  TransformComponent.getWorldPosition(entity, xruiTransform.position)

  if (hasComponent(xrui.entity, VisibleComponent)) {
    const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)
    if (boundingBox) {
      const boundingBoxHeight = boundingBox.box.max.y - boundingBox.box.min.y
      xruiTransform.position.y += boundingBoxHeight * 2
    } else {
      xruiTransform.position.y += 0.5
    }
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    xruiTransform.rotation.copy(cameraTransform.rotation)
  }

  const transition = InteractableTransitions.get(entity)!
  const isGrabbed = hasComponent(entity, GrabbedComponent)
  if (isGrabbed) {
    if (transition.state === 'IN') {
      transition.setState('OUT')
      removeComponent(xrui.entity, VisibleComponent)
    }
  } else {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    if (selfAvatarEntity) {
      getAvatarBoneWorldPosition(selfAvatarEntity, VRMHumanBoneName.Chest, vec3)
      const distance = vec3.distanceToSquared(xruiTransform.position)
      const inRange = distance < getState(InteractableState).maxDistance
      if (transition.state === 'OUT' && inRange) {
        transition.setState('IN')
        setComponent(xrui.entity, VisibleComponent)
      }
      if (transition.state === 'IN' && !inRange) {
        transition.setState('OUT')
      }
    }
  }
  const deltaSeconds = getState(ECSState).deltaSeconds
  transition.update(deltaSeconds, (opacity) => {
    if (opacity === 0) {
      removeComponent(xrui.entity, VisibleComponent)
    }
    xrui.container.rootLayer.traverseLayersPreOrder((layer) => {
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = opacity
    })
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

/**
 * @todo refactor this into i18n and configurable
 */
export const grabbableInteractMessage = 'Grab'

/** @todo replace this with event sourcing */
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)

const ownedGrabbableQuery = defineQuery([GrabbableComponent, NetworkObjectAuthorityTag])
const grabbableQuery = defineQuery([GrabbableComponent])

const onDrop = () => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  const grabber = getComponent(selfAvatarEntity, GrabberComponent)
  const handedness = getState(InputState).preferredHand
  const grabbedEntity = grabber[handedness]!
  if (!grabbedEntity) return
  dropEntity(selfAvatarEntity)
}

const onGrab = (targetEntity: Entity, handedness = getState(InputState).preferredHand) => {
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!hasComponent(targetEntity, GrabbableComponent)) return
  const grabber = getComponent(selfAvatarEntity, GrabberComponent)
  const grabbedEntity = grabber[handedness]!
  if (!grabbedEntity) return
  if (grabbedEntity) {
    onDrop()
  } else {
    grabEntity(selfAvatarEntity, targetEntity, handedness)
  }
}

const execute = () => {
  if (getState(EngineState).isEditor) return

  for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)

  /**
   * @todo use an XRUI pool
   * @todo this should move to animation group
   */
  if (isClient)
    for (const entity of grabbableQuery.enter()) {
      addInteractableUI(entity, createInteractUI(entity, grabbableInteractMessage), onGrabbableInteractUpdate)
    }

  for (const entity of grabbableQuery.exit()) {
    removeInteractableUI(entity)
  }

  for (const entity of ownedGrabbableQuery()) {
    grabbableQueryAll(entity)
  }
}

const executeInput = () => {
  const inputPointerEntity = InputPointerComponent.getPointerForCanvas(Engine.instance.viewerEntity)
  if (!inputPointerEntity) return

  const buttons = InputSourceComponent.getMergedButtons()
  if (buttons.KeyU?.down) onDrop()

  /** @todo this should move to input group */
  const nonCapturedInputSources = InputSourceComponent.nonCapturedInputSources()
  for (const entity of nonCapturedInputSources) {
    const inputSource = getComponent(entity, InputSourceComponent)
    /** @todo currently mouse has to be over the grabbable for it to be grabbed */
    if (buttons.KeyE?.down || inputSource.buttons[XRStandardGamepadButton.Trigger]?.down)
      onGrab(getState(InteractableState).available[0], inputSource.source.handedness === 'left' ? 'left' : 'right')
  }
}

export const GrabbableSystem = defineSystem({
  uuid: 'ee.engine.GrabbableSystem',
  insert: { with: SimulationSystemGroup },
  execute
})

export const GrabbableInputSystem = defineSystem({
  uuid: 'ee.engine.GrabbableInputSystem',
  insert: { after: ClientInputSystem },
  execute: executeInput
})
