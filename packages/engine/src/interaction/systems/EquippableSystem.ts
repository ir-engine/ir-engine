import { RigidBodyType } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

import { createActionQueue, dispatchAction, removeActionQueue } from '@xrengine/hyperflux'

import { getHandTarget } from '../../avatar/components/AvatarIKComponents'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import {
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  RigidBodyKinematicPositionBasedTagComponent
} from '../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EquippableComponent, SCENE_COMPONENT_EQUIPPABLE } from '../components/EquippableComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippableAttachmentPoint } from '../enums/EquippedEnums'
import { changeHand, equipEntity, getAttachmentPoint, getParity } from '../functions/equippableFunctions'
import { createInteractUI } from '../functions/interactUI'
import { addInteractableUI, removeInteractiveUI } from './InteractiveSystem'

export function setEquippedObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.setEquippedObject>,
  world = Engine.instance.currentWorld
) {
  const equippedEntity = world.getNetworkObject(action.object.ownerId, action.object.networkId)!
  if (action.$from === Engine.instance.userId) {
    const equipperEntity = world.localClientEntity
    addComponent(equipperEntity, EquipperComponent, { equippedEntity })
    addComponent(equippedEntity, EquippedComponent, { equipperEntity, attachmentPoint: action.attachmentPoint })
  }
  const body = getComponent(equippedEntity, RigidBodyComponent)?.body
  if (body) {
    if (action.equip) {
      addComponent(equippedEntity, RigidBodyKinematicPositionBasedTagComponent, true)
      removeComponent(equippedEntity, RigidBodyDynamicTagComponent)
      body.setBodyType(RigidBodyType.KinematicPositionBased)
    } else {
      addComponent(equippedEntity, RigidBodyDynamicTagComponent, true)
      removeComponent(equippedEntity, RigidBodyKinematicPositionBasedTagComponent)
      body.setBodyType(RigidBodyType.Dynamic)
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
  action: ReturnType<typeof WorldNetworkAction.transferAuthorityOfObject>,
  world = Engine.instance.currentWorld
) {
  if (action.newAuthority !== Engine.instance.userId) return
  const equippableEntity = world.getNetworkObject(action.ownerId, action.networkId)!
  if (hasComponent(equippableEntity, EquippableComponent)) {
    dispatchAction(
      WorldNetworkAction.setEquippedObject({
        object: {
          networkId: action.networkId,
          ownerId: action.ownerId
        },
        equip: !hasComponent(equippableEntity, EquippedComponent),
        // todo, pass attachment point through actions somehow
        attachmentPoint: EquippableAttachmentPoint.RIGHT_HAND
      })
    )
  }
}

// since equippables are all client authoritative, we don't need to recompute this for all users
export function equipperQueryAll(equipperEntity: Entity, world = Engine.instance.currentWorld) {
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  const equippedEntity = equipperComponent.equippedEntity
  if (!equippedEntity) return

  const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
  const attachmentPoint = equippedComponent.attachmentPoint

  const target = getHandTarget(equipperEntity, getParity(attachmentPoint))!
  const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)

  target.getWorldPosition(equippableTransform.position)
  target.getWorldQuaternion(equippableTransform.rotation)
}

export function equipperQueryExit(entity: Entity, world = Engine.instance.currentWorld) {
  const equipperComponent = getComponent(entity, EquipperComponent, true)
  const equippedEntity = equipperComponent.equippedEntity
  removeComponent(equippedEntity, EquippedComponent)
}

const vec3 = new Vector3()

// export const onEquippableInteractUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
//   const world = Engine.instance.currentWorld

//   const transform = getComponent(xrui.entity, TransformComponent)
//   if (!transform || !hasComponent(world.localClientEntity, TransformComponent)) return
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
//     getAvatarBoneWorldPosition(world.localClientEntity, 'Hips', vec3)
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
//     xrui.container.rootLayer.traverseLayersPreOrder((layer) => {
//       const mat = layer.contentMesh.material as MeshBasicMaterial
//       mat.opacity = opacity
//     })
//   })
// }

/**
 * @todo refactor this into i18n and configurable
 */
export const equippableInteractMessage = 'Equip'

export default async function EquippableSystem(world: World) {
  world.sceneComponentRegistry.set(EquippableComponent.name, SCENE_COMPONENT_EQUIPPABLE)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_EQUIPPABLE, {})

  const interactedActionQueue = createActionQueue(EngineActions.interactedWithObject.matches)
  const transferAuthorityOfObjectQueue = createActionQueue(WorldNetworkAction.transferAuthorityOfObject.matches)
  const setEquippedObjectQueue = createActionQueue(WorldNetworkAction.setEquippedObject.matches)

  const equipperQuery = defineQuery([EquipperComponent])
  const equippableQuery = defineQuery([EquippableComponent])

  const execute = () => {
    for (const action of interactedActionQueue()) {
      if (action.$from !== Engine.instance.userId) continue
      if (!hasComponent(action.targetEntity!, EquippableComponent)) continue

      const avatarEntity = Engine.instance.currentWorld.localClientEntity

      const equipperComponent = getComponent(avatarEntity, EquipperComponent)
      if (equipperComponent?.equippedEntity) {
        const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
        const attachmentPoint = equippedComponent.attachmentPoint
        const currentParity = getParity(attachmentPoint)
        if (currentParity !== action.parityValue) {
          changeHand(avatarEntity, getAttachmentPoint(action.parityValue))
        } else {
          // drop(entity, inputKey, inputValue)
        }
      } else {
        equipEntity(avatarEntity, action.targetEntity!)
      }
    }

    for (const action of setEquippedObjectQueue()) setEquippedObjectReceptor(action)

    for (const action of transferAuthorityOfObjectQueue()) transferAuthorityOfObjectReceptor(action)

    /**
     * @todo use an XRUI pool
     */
    for (const entity of equippableQuery.enter()) {
      if (isClient) addInteractableUI(entity, createInteractUI(entity, equippableInteractMessage))
      if (Engine.instance.currentWorld.worldNetwork?.isHosting) {
        const objectUuid = world.entityTree.entityNodeMap.get(entity)?.uuid!
        dispatchAction(WorldNetworkAction.registerSceneObject({ objectUuid }))
      }
    }

    for (const entity of equippableQuery.exit()) {
      removeInteractiveUI(entity)
    }

    for (const entity of equipperQuery()) {
      equipperQueryAll(entity, world)
    }

    for (const entity of equipperQuery.exit()) {
      equipperQueryExit(entity, world)
    }
  }

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(EquippableComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_EQUIPPABLE)

    removeActionQueue(interactedActionQueue)
    removeActionQueue(transferAuthorityOfObjectQueue)
    removeActionQueue(setEquippedObjectQueue)

    removeQuery(world, equipperQuery)
    removeQuery(world, equippableQuery)
  }

  return { execute, cleanup }
}
