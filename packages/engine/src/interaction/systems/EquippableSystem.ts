import { MeshBasicMaterial, Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { getAvatarBoneWorldPosition } from '../../avatar/functions/avatarFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { RigidBodyDynamicTagComponent } from '../../physics/components/RigidBodyDynamicTagComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { EquippableComponent } from '../components/EquippableComponent'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { changeHand, getAttachmentPoint, getParity } from '../functions/equippableFunctions'
import { createInteractUI } from '../functions/interactUI'
import {
  addInteractableUI,
  InteractableTransitions,
  onInteractableUpdate,
  removeInteractiveUI
} from './InteractiveSystem'

export function setEquippedObjectReceptor(
  action: ReturnType<typeof WorldNetworkAction.setEquippedObject>,
  world = Engine.instance.currentWorld
) {
  if (action.$from === Engine.instance.userId) return
  const equipper = world.getUserAvatarEntity(action.$from)
  const equipped = world.getNetworkObject(action.object.ownerId, action.object.networkId)
  const attachmentPoint = action.attachmentPoint
  if (!equipped) {
    return console.warn(`Equipped entity with id ${equipped} does not exist! You should probably reconnect...`)
  }
  if (action.equip) {
    if (!hasComponent(equipper, EquipperComponent) && !hasComponent(equipped, EquippedComponent)) {
      addComponent(equipper, EquipperComponent, { equippedEntity: equipped, data: {} as any })
      addComponent(equipped, EquippedComponent, { equipperEntity: equipper, attachmentPoint: attachmentPoint })
    }
  } else {
    const equipperComponent = getComponent(equipper, EquipperComponent)
    if (!equipperComponent) return

    removeComponent(equipper, EquipperComponent)
  }
}

export function equipperQueryEnter(entity: Entity, world = Engine.instance.currentWorld) {
  const equipperComponent = getComponent(entity, EquipperComponent)
  if (equipperComponent) {
    const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
    // TODO: Equippables to Rapier
    // const collider = getComponent(equippedEntity, ColliderComponent)
    // if (collider) {
    //   let phsyxRigidbody = collider.body as PhysX.PxRigidBody
    //   world.physics.changeRigidbodyType(phsyxRigidbody, BodyType.KINEMATIC)
    // }
  }
}

// since equippables are all client authoritative, we don't need to recompute this for all users
export function equipperQueryAll(equipperEntity: Entity, world = Engine.instance.currentWorld) {
  if (!hasComponent(equipperEntity, NetworkObjectOwnedTag)) return
  const equipperComponent = getComponent(equipperEntity, EquipperComponent)
  const equippedEntity = equipperComponent.equippedEntity
  if (equippedEntity) {
    const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
    const attachmentPoint = equippedComponent.attachmentPoint
    const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
    const handTransform = getHandTransform(equipperEntity, getParity(attachmentPoint))
    const { position, rotation } = handTransform

    // TODO: Equippables to Rapier
    // const collider = getComponent(equippedEntity, ColliderComponent)
    // if (collider) {
    //   teleportRigidbody(collider.body, position, rotation)
    // }

    equippableTransform.position.copy(position)
    equippableTransform.rotation.copy(rotation)
  }
}

export function equipperQueryExit(entity: Entity, world = Engine.instance.currentWorld) {
  const equipperComponent = getComponent(entity, EquipperComponent, true)
  const equippedEntity = equipperComponent.equippedEntity

  const equippedTransform = getComponent(equippedEntity, TransformComponent)
  const collider = getComponent(equippedEntity, RigidBodyDynamicTagComponent)
  if (collider) {
    // TODO: Equippables to Rapier
    // let phsyxRigidbody = collider.body as PhysX.PxRigidBody
    // world.physics.changeRigidbodyType(phsyxRigidbody, BodyType.DYNAMIC)
    // teleportRigidbody(collider.body, equippedTransform.position, equippedTransform.rotation)
  }

  removeComponent(equippedEntity, EquippedComponent)
}

const vec3 = new Vector3()

export const onEquippableInteractUpdate = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  const world = Engine.instance.currentWorld
  const isEquipped = hasComponent(entity, EquippedComponent)
  const transform = getComponent(xrui.entity, TransformComponent)
  if (!transform || !getComponent(world.localClientEntity, TransformComponent)) return
  transform.position.copy(getComponent(entity, TransformComponent).position)
  transform.rotation.copy(getComponent(entity, TransformComponent).rotation)
  transform.position.y += 1
  const transition = InteractableTransitions.get(entity)!
  getAvatarBoneWorldPosition(world.localClientEntity, 'Hips', vec3)
  const distance = vec3.distanceToSquared(transform.position)
  const inRange = distance < 5
  if (transition.state === 'OUT' && inRange) {
    transition.setState('IN')
  }
  if (transition.state === 'IN' && !inRange) {
    transition.setState('OUT')
  }
  transition.update(world, (opacity) => {
    xrui.container.rootLayer.traverseLayersPreOrder((layer) => {
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = opacity
    })
  })
}

/**
 * @todo refactor this into i18n and configurable
 */
export const equippableInteractMessage = 'Equip'

export default async function EquippableSystem(world: World) {
  const setEquippedObjectQueue = createActionQueue(WorldNetworkAction.setEquippedObject.matches)
  const interactedActionQueue = createActionQueue(EngineActions.interactedWithObject.matches)

  const equipperQuery = defineQuery([EquipperComponent])
  const equippableQuery = defineQuery([EquippedComponent])

  return () => {
    for (const action of interactedActionQueue()) {
      if (action.$from !== Engine.instance.userId) continue
      if (!hasComponent(action.targetEntity, EquippableComponent)) continue

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
        continue
      }
    }

    for (const action of setEquippedObjectQueue()) setEquippedObjectReceptor(action, world)

    /**
     * @todo use an XRUI pool
     */
    for (const entity of equippableQuery.enter()) {
      addInteractableUI(entity, createInteractUI(entity, equippableInteractMessage))
    }

    for (const entity of equippableQuery.exit()) {
      removeInteractiveUI(entity)
    }

    for (const entity of equipperQuery.enter()) {
      equipperQueryEnter(entity, world)
    }

    for (const entity of equipperQuery()) {
      equipperQueryAll(entity, world)
    }

    for (const entity of equipperQuery.exit()) {
      equipperQueryExit(entity, world)
    }
  }
}
