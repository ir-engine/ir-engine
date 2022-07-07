import { createActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
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
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { teleportRigidbody } from '../../physics/functions/teleportRigidbody'
import { BodyType } from '../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { EquippedComponent } from '../components/EquippedComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { getParity } from '../functions/equippableFunctions'

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

export function equippableQueryEnter(entity: Entity, world = Engine.instance.currentWorld) {
  const equipperComponent = getComponent(entity, EquipperComponent)
  if (equipperComponent) {
    const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
    const collider = getComponent(equippedEntity, ColliderComponent)
    if (collider) {
      let phsyxRigidbody = collider.body as PhysX.PxRigidBody
      world.physics.changeRigidbodyType(phsyxRigidbody, BodyType.KINEMATIC)
    }
  }
}

// since equippables are all client authoritative, we don't need to recompute this for all users
export function equippableQueryAll(entity: Entity, world = Engine.instance.currentWorld) {
  if (entity !== world.localClientEntity) return
  const equipperComponent = getComponent(entity, EquipperComponent)
  const equippedEntity = equipperComponent.equippedEntity
  if (equippedEntity) {
    const isOwnedByMe = getComponent(equippedEntity, NetworkObjectOwnedTag)
    if (isOwnedByMe) {
      const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
      const attachmentPoint = equippedComponent.attachmentPoint
      const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
      const handTransform = getHandTransform(entity, getParity(attachmentPoint))
      const { position, rotation } = handTransform

      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) {
        teleportRigidbody(collider.body, position, rotation)
      }

      equippableTransform.position.copy(position)
      equippableTransform.rotation.copy(rotation)
    }
  }
}

export function equippableQueryExit(entity: Entity, world = Engine.instance.currentWorld) {
  const equipperComponent = getComponent(entity, EquipperComponent, true)
  const equippedEntity = equipperComponent.equippedEntity

  const equippedTransform = getComponent(equippedEntity, TransformComponent)
  const collider = getComponent(equippedEntity, ColliderComponent)
  if (collider) {
    let phsyxRigidbody = collider.body as PhysX.PxRigidBody
    world.physics.changeRigidbodyType(phsyxRigidbody, BodyType.DYNAMIC)
    teleportRigidbody(collider.body, equippedTransform.position, equippedTransform.rotation)
  }

  removeComponent(equippedEntity, EquippedComponent)
}

/**
 * @author Josh Field <github.com/HexaField>
 * @author Hamza Mushtaq <github.com/hamzzam>
 */
export default async function EquippableSystem(world: World) {
  const setEquippedObjectQueue = createActionQueue(WorldNetworkAction.setEquippedObject.matches)

  const equippableQuery = defineQuery([EquipperComponent])

  return () => {
    for (const action of setEquippedObjectQueue()) setEquippedObjectReceptor(action, world)

    for (const entity of equippableQuery.enter()) {
      equippableQueryEnter(entity, world)
    }

    for (const entity of equippableQuery()) {
      equippableQueryAll(entity, world)
    }

    for (const entity of equippableQuery.exit()) {
      equippableQueryExit(entity, world)
    }
  }
}
