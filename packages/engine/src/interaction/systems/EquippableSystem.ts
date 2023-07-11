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
import { MeshBasicMaterial, Vector3 } from 'three'

import { defineActionQueue, dispatchAction, getState } from '@etherealengine/hyperflux'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { V_000 } from '../../common/constants/MathConstants'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/Physics'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyKinematicPositionBasedTagComponent
} from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { ColliderComponent } from '../../scene/components/ColliderComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectFitFunctions } from '../../xrui/functions/ObjectFitFunctions'
import { BoundingBoxComponent } from '../components/BoundingBoxComponents'
import { EquippableComponent } from '../components/EquippableComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { changeHand, equipEntity, unequipEntity } from '../functions/equippableFunctions'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI, InteractableTransitions, removeInteractiveUI } from './InteractiveSystem'

export function setEquippedObjectReceptor(action: ReturnType<typeof WorldNetworkAction.setEquippedObject>) {
  const equippedEntity = Engine.instance.getNetworkObject(action.object.ownerId, action.object.networkId)!
  // todo, ensure the user has authority when equipping
  if (action.equip && action.$from === Engine.instance.userId) {
    const equipperEntity = Engine.instance.localClientEntity
    setComponent(equipperEntity, EquipperComponent, { equippedEntity })
    setComponent(equippedEntity, EquippedComponent, { equipperEntity, attachmentPoint: action.attachmentPoint! })
  }
  if (action.equip) {
    if (hasComponent(equippedEntity, LocalTransformComponent)) {
      removeComponent(equippedEntity, LocalTransformComponent)
    }
    if (hasComponent(equippedEntity, ColliderComponent)) {
      removeComponent(equippedEntity, ColliderComponent)
    }
  }
  const body = getComponent(equippedEntity, RigidBodyComponent)?.body
  if (body) {
    if (action.equip) {
      Physics.changeRigidbodyType(equippedEntity, RigidBodyType.KinematicPositionBased)
    } else {
      Physics.changeRigidbodyType(equippedEntity, RigidBodyType.Dynamic)
    }
    for (let i = 0; i < body.numColliders(); i++) {
      const collider = body.collider(i)
      let oldCollisionGroups = collider.collisionGroups()
      oldCollisionGroups ^= CollisionGroups.Default << 16
      collider.setCollisionGroups(oldCollisionGroups)
    }
  }
}

export function transferAuthorityOfObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.transferAuthorityOfObject>
) {
  if (action.newAuthority !== Engine.instance.peerID) return
  const equippableEntity = Engine.instance.getNetworkObject(action.ownerId, action.networkId)!
  if (hasComponent(equippableEntity, EquippableComponent)) {
    dispatchAction(
      WorldNetworkAction.setEquippedObject({
        object: {
          networkId: action.networkId,
          ownerId: action.ownerId
        },
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

  const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
  const attachmentPoint = equippedComponent.attachmentPoint

  const target = getHandTarget(equipperEntity, attachmentPoint ?? 'right')!

  const rigidbodyComponent = getComponent(equippedEntity, RigidBodyComponent)

  if (rigidbodyComponent) {
    rigidbodyComponent.targetKinematicPosition.copy(target.position)
    rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
    rigidbodyComponent.body.setTranslation(target.position, true)
    rigidbodyComponent.body.setRotation(target.rotation, true)
  }

  const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
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

/**
 * @todo refactor this into i18n and configurable
 */
export const equippableInteractMessage = 'Grab'

const interactedActionQueue = defineActionQueue(EngineActions.interactedWithObject.matches)
const transferAuthorityOfObjectQueue = defineActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
const setEquippedObjectQueue = defineActionQueue(WorldNetworkAction.setEquippedObject.matches)

const equipperQuery = defineQuery([EquipperComponent])
const equipperInputQuery = defineQuery([LocalInputTagComponent, EquipperComponent])
const equippableQuery = defineQuery([EquippableComponent])

const onKeyU = () => {
  for (const entity of equipperInputQuery()) {
    const equipper = getComponent(entity, EquipperComponent)
    if (!equipper.equippedEntity) return
    unequipEntity(entity)
  }
}

const execute = () => {
  if (getState(EngineState).isEditor) return

  const nonCapturedInputSource = InputSourceComponent.nonCapturedInputSourceQuery()[0]
  if (nonCapturedInputSource) {
    const inputSource = getComponent(nonCapturedInputSource, InputSourceComponent)
    if (inputSource.buttons.KeyU?.down) onKeyU()
  }

  for (const action of interactedActionQueue()) {
    if (
      action.$from !== Engine.instance.userId ||
      !action.targetEntity ||
      !entityExists(action.targetEntity!) ||
      !hasComponent(action.targetEntity!, EquippableComponent)
    )
      continue

    const avatarEntity = Engine.instance.localClientEntity

    const equipperComponent = getComponent(avatarEntity, EquipperComponent)
    if (equipperComponent?.equippedEntity) {
      /** @todo - figure better way of swapping hands */
      // const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
      // const attachmentPoint = equippedComponent.attachmentPoint
      // if (attachmentPoint !== action.handedness) {
      //   changeHand(avatarEntity, action.handedness)
      // } else {
      //   drop(entity, inputKey, inputValue)
      // }
      unequipEntity(avatarEntity)
    } else {
      equipEntity(avatarEntity, action.targetEntity!, 'right')
    }
  }

  for (const action of setEquippedObjectQueue()) setEquippedObjectReceptor(action)

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

export const EquippableSystem = defineSystem({
  uuid: 'ee.engine.EquippableSystem',
  execute
})
