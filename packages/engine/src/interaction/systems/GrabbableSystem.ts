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
import { useEffect } from 'react'
import React from 'react'
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
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
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
import { EquippableComponent } from '../components/EquippableComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI, InteractableTransitions, removeInteractiveUI } from './InteractiveSystem'

export class GrabbableNetworkAction {
  static setGrabbedObject = defineAction({
    type: 'ee.engine.equippables.SET_GRABBED_OBJECT',
    entityUUID: matchesEntityUUID,
    equip: matches.boolean,
    attachmentPoint: matches.literals('left', 'right', 'none'),
    equipperUserId: matchesEntityUUID,
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
      equipperUserId: EntityUUID
    }
  >,

  receptors: [
    [
      GrabbableNetworkAction.setGrabbedObject,
      (state, action: typeof GrabbableNetworkAction.setGrabbedObject.matches._TYPE) => {
        if (action.equip)
          state[action.entityUUID].set({
            attachmentPoint: action.attachmentPoint,
            equipperUserId: action.equipperUserId
          })
        else state[action.entityUUID].set(none)
      }
    ]
  ]
})

const GrabbableReactor = React.memo(({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(GrabbableState)[entityUUID])
  const entity = UUIDComponent.entitiesByUUID[entityUUID]
  const isAuthority = !!useComponent(entity, NetworkObjectAuthorityTag)
  const equipperEntity = UUIDComponent.entitiesByUUID[state.equipperUserId.value as EntityUUID]
  const attachmentPoint = state.attachmentPoint.value

  useEffect(() => {
    setComponent(equipperEntity, EquipperComponent, { equippedEntity: entity })
    setComponent(entity, EquippedComponent, {
      equipperEntity,
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
      removeComponent(entity, EquippedComponent)
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
  }, [isAuthority])

  return null
})

/** @deprecated @todo - replace with reactor */
export function transferAuthorityOfObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.transferAuthorityOfObject>
) {
  if (action.newAuthority !== Engine.instance.peerID) return
  const equippableEntity = Engine.instance.getNetworkObject(action.ownerId, action.networkId)!
  if (hasComponent(equippableEntity, EquippableComponent)) {
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(equippableEntity, UUIDComponent),
        equipperUserId: action.$from as string as EntityUUID,
        equip: !hasComponent(equippableEntity, EquippedComponent),
        // todo, pass attachment point through actions somehow
        attachmentPoint: 'right'
      })
    )
  }
}

// since equippables are all client authoritative, we don't need to recompute this for all users
export function equipperQueryAll(equipperEntity: Entity) {
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  const equippedEntity = equipperComponent.equippedEntity
  if (!equippedEntity) return

  const equippedComponent = getComponent(equippedEntity, EquippedComponent)
  const attachmentPoint = equippedComponent.attachmentPoint

  const target = getHandTarget(equipperEntity, attachmentPoint ?? 'right')!

  const rigidbodyComponent = getComponent(equippedEntity, RigidBodyComponent)

  if (rigidbodyComponent) {
    rigidbodyComponent.targetKinematicPosition.copy(target.position)
    rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
    rigidbodyComponent.body.setTranslation(target.position, true)
    rigidbodyComponent.body.setRotation(target.rotation, true)
  }

  const equippableTransform = getComponent(equippedEntity, TransformComponent)
  equippableTransform.position.copy(target.position)
  equippableTransform.rotation.copy(target.rotation)
}

const vec3 = new Vector3()

export const onEquippableInteractUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
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
  const isEquipped = hasComponent(entity, EquippedComponent)
  if (isEquipped) {
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

export const equipEntity = (equipperEntity: Entity, equippedEntity: Entity, attachmentPoint: XRHandedness): void => {
  const networkComponent = getComponent(equippedEntity, NetworkObjectComponent)
  if (networkComponent.authorityPeerID === Engine.instance.peerID) {
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(equippedEntity, UUIDComponent),
        equipperUserId: getComponent(equipperEntity, UUIDComponent),
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

export const unequipEntity = (equipperEntity: Entity): void => {
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  if (!equipperComponent) return
  const equippedEntity = equipperComponent.equippedEntity!
  if (!equippedEntity) return
  const networkComponent = getComponent(equippedEntity, NetworkObjectComponent)
  if (networkComponent.authorityPeerID === Engine.instance.peerID) {
    dispatchAction(
      GrabbableNetworkAction.setGrabbedObject({
        entityUUID: getComponent(equippedEntity, UUIDComponent),
        equipperUserId: getComponent(equipperEntity, UUIDComponent),
        attachmentPoint: 'none',
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

/**
 * @todo refactor this into i18n and configurable
 */
export const equippableInteractMessage = 'Grab'

const interactedActionQueue = defineActionQueue(EngineActions.interactedWithObject.matches)
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)

const equipperQuery = defineQuery([EquipperComponent])
const equippableQuery = defineQuery([EquippableComponent])

const onUnequip = () => {
  const equipper = getComponent(Engine.instance.localClientEntity, EquipperComponent)
  if (!equipper?.equippedEntity) return
  unequipEntity(Engine.instance.localClientEntity)
}

const onEquip = (targetEntity: Entity, handedness = 'right' as XRHandedness) => {
  const equipper = getComponent(Engine.instance.localClientEntity, EquipperComponent)
  if (equipper?.equippedEntity) {
    onUnequip()
  } else {
    equipEntity(Engine.instance.localClientEntity, targetEntity, handedness)
  }
}

const execute = () => {
  if (getState(EngineState).isEditor) return

  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSourceQuery()[0]
  if (nonCapturedInputSource) {
    const inputSource = getComponent(nonCapturedInputSource, InputSourceComponent)
    if (inputSource.buttons.KeyU?.down) onUnequip()
    if (inputSource.buttons.KeyE?.down) onEquip(inputSource.assignedButtonEntity)
  }

  for (const action of interactedActionQueue()) {
    if (action.targetEntity && hasComponent(action.targetEntity, EquippableComponent)) {
      onEquip(action.targetEntity, action.handedness)
    }
  }

  for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)

  /**
   * @todo use an XRUI pool
   */
  if (isClient)
    for (const entity of equippableQuery.enter()) {
      addInteractableUI(entity, createInteractUI(entity, equippableInteractMessage), onEquippableInteractUpdate)
    }

  for (const entity of equippableQuery.exit()) {
    removeInteractiveUI(entity)
  }

  for (const entity of equipperQuery()) {
    equipperQueryAll(entity)
  }
}

export const GrabbableSystem = defineSystem({
  uuid: 'ee.engine.GrabbableSystem',
  execute,
  reactor: GrabbableReactor
})
