import { RigidBodyType } from '@dimforge/rapier3d-compat'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import {
  createActionQueue,
  dispatchAction,
  getMutableState,
  removeActionQueue,
  startReactor,
  useHookstate
} from '@etherealengine/hyperflux'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyKinematicPositionBasedTagComponent
} from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EquippableComponent, SCENE_COMPONENT_EQUIPPABLE } from '../components/EquippableComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { changeHand, equipEntity, unequipEntity } from '../functions/equippableFunctions'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI, removeInteractiveUI } from './InteractiveSystem'

export function setEquippedObjectReceptor(action: ReturnType<typeof WorldNetworkAction.setEquippedObject>) {
  const equippedEntity = Engine.instance.getNetworkObject(action.object.ownerId, action.object.networkId)!
  if (action.$from === Engine.instance.userId) {
    const equipperEntity = Engine.instance.localClientEntity
    addComponent(equipperEntity, EquipperComponent, { equippedEntity })
    addComponent(equippedEntity, EquippedComponent, { equipperEntity, attachmentPoint: action.attachmentPoint })
  }
  const body = getComponent(equippedEntity, RigidBodyComponent)?.body
  if (body) {
    if (action.equip) {
      addComponent(equippedEntity, RigidBodyKinematicPositionBasedTagComponent, true)
      removeComponent(equippedEntity, RigidBodyDynamicTagComponent)
      body.setBodyType(RigidBodyType.KinematicPositionBased, false)
    } else {
      addComponent(equippedEntity, RigidBodyDynamicTagComponent, true)
      removeComponent(equippedEntity, RigidBodyKinematicPositionBasedTagComponent)
      body.setBodyType(RigidBodyType.Dynamic, false)
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
  if (action.newAuthority !== Engine.instance.worldNetwork?.peerID) return
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

  const target = getHandTarget(equipperEntity, attachmentPoint ?? 'left')!
  const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)

  target.getWorldPosition(equippableTransform.position)
  target.getWorldQuaternion(equippableTransform.rotation)
}

export function equipperQueryExit(entity: Entity) {
  // const equipperComponent = getComponent(entity, EquipperComponent, true)
  // const equippedEntity = equipperComponent.equippedEntity
  // removeComponent(equippedEntity, EquippedComponent)
}

const vec3 = new Vector3()

// export const onEquippableInteractUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
//
//   const transform = getComponent(xrui.entity, TransformComponent)
//   if (!transform || !hasComponent(Engine.instance.localClientEntity, TransformComponent)) return
//   transform.position.copy(getComponent(entity, TransformComponent).position)
//   transform.rotation.copy(getComponent(entity, TransformComponent).rotation)
//   transform.position.y += 1

//   const transition = InteractableTransitions.get(entity)!
//   const isEquipped = hasComponent(entity, EquippedComponent)
//   if (isEquipped) {
//     if (transition.state === 'IN') {
//       transition.setState('OUT')
//     }
//   } else {
//     getAvatarBoneWorldPosition(Engine.instance.localClientEntity, 'Hips', vec3)
//     const distance = vec3.distanceToSquared(transform.position)
//     const inRange = distance < 5
//     if (transition.state === 'OUT' && inRange) {
//       transition.setState('IN')
//     }
//     if (transition.state === 'IN' && !inRange) {
//       transition.setState('OUT')
//     }
//   }
//   transition.update(world, (opacity) => {
//     xrui.rootLayer.traverseLayersPreOrder((layer) => {
//       const mat = layer.contentMesh.material as MeshBasicMaterial
//       mat.opacity = opacity
//     })
//   })
// }

/**
 * @todo refactor this into i18n and configurable
 */
export const equippableInteractMessage = 'Equip'

export default async function EquippableSystem() {
  Engine.instance.sceneComponentRegistry.set(EquippableComponent.name, SCENE_COMPONENT_EQUIPPABLE)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_EQUIPPABLE, {})

  const interactedActionQueue = createActionQueue(EngineActions.interactedWithObject.matches)
  const transferAuthorityOfObjectQueue = createActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
  const setEquippedObjectQueue = createActionQueue(WorldNetworkAction.setEquippedObject.matches)

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
    const keys = Engine.instance.buttons
    if (keys.KeyU?.down) onKeyU()

    for (const action of interactedActionQueue()) {
      if (action.$from !== Engine.instance.userId) continue
      if (!hasComponent(action.targetEntity!, EquippableComponent)) continue

      const avatarEntity = Engine.instance.localClientEntity

      const equipperComponent = getComponent(avatarEntity, EquipperComponent)
      if (equipperComponent?.equippedEntity) {
        const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
        const attachmentPoint = equippedComponent.attachmentPoint
        if (attachmentPoint !== action.handedness) {
          changeHand(avatarEntity, action.handedness)
        } else {
          // drop(entity, inputKey, inputValue)
        }
      } else {
        equipEntity(avatarEntity, action.targetEntity!, 'none')
      }
    }

    for (const action of setEquippedObjectQueue()) setEquippedObjectReceptor(action)

    for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)

    /**
     * @todo use an XRUI pool
     */
    for (const entity of equippableQuery.enter()) {
      if (isClient) addInteractableUI(entity, createInteractUI(entity, equippableInteractMessage))
      if (Engine.instance.worldNetwork?.isHosting) {
        const objectUuid = getComponent(entity, UUIDComponent)
        dispatchAction(WorldNetworkAction.registerSceneObject({ objectUuid }))
      }
    }

    for (const entity of equippableQuery.exit()) {
      removeInteractiveUI(entity)
    }

    for (const entity of equipperQuery()) {
      equipperQueryAll(entity)
    }

    for (const entity of equipperQuery.exit()) {
      equipperQueryExit(entity)
    }
  }

  const cleanup = async () => {
    Engine.instance.sceneComponentRegistry.delete(EquippableComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_EQUIPPABLE)

    removeActionQueue(interactedActionQueue)
    removeActionQueue(transferAuthorityOfObjectQueue)
    removeActionQueue(setEquippedObjectQueue)

    removeQuery(equipperQuery)
    removeQuery(equippableQuery)
  }

  return { execute, cleanup }
}
