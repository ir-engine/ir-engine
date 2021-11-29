import { defineQuery, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import matches from 'ts-matches'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { teleportRigidbody } from '../../physics/functions/teleportRigidbody'
import { Engine } from '../../ecs/classes/Engine'
import { equipEntity, getParity, unequipEntity } from '../functions/equippableFunctions'
import { isClient } from '../../common/functions/isClient'
import { EquippedComponent } from '../components/EquippedComponent'

function equippableActionReceptor(action) {
  const world = useWorld()

  matches(action).when(NetworkWorldAction.setEquippedObject.matchesFromAny, (a) => {
    if (a.userId === Engine.userId) return
    const equipper = world.getUserAvatarEntity(a.userId)
    const equipped = world.getNetworkObject(a.networkId)
    const attachmentPoint = a.attachmentPoint
    if (!equipped) {
      return console.warn(`Equipped entity with id ${equipped} does not exist! You should probably reconnect...`)
    }
    if (a.equip) {
      equipEntity(equipper, equipped, attachmentPoint)
    } else {
      unequipEntity(equipper)
    }
  })
}

/**
 * @author Josh Field <github.com/HexaField>
 */
export default async function EquippableSystem(world: World): Promise<System> {
  world.receptors.push(equippableActionReceptor)

  // const networkUserQuery = defineQuery([Not(LocalInputTagComponent), AvatarComponent, TransformComponent])
  const equippableQuery = defineQuery([EquipperComponent])

  return () => {
    for (const entity of equippableQuery.enter()) {
      const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
      const collider = getComponent(equippedEntity, ColliderComponent)
      // if (collider) collider.body.type = BodyType.KINEMATIC

      if (isClient) {
        const equippedComponent = getComponent(equippedEntity, EquippedComponent)
        const attachmentPoint = equippedComponent.attachmentPoint
        const networkComponet = getComponent(equippedEntity, NetworkObjectComponent)
        dispatchFrom(Engine.userId, () =>
          NetworkWorldAction.setEquippedObject({
            userId: Engine.userId,
            networkId: networkComponet.networkId,
            attachmentPoint: attachmentPoint,
            equip: true
          })
        )
      }
    }

    for (const entity of equippableQuery()) {
      const equipperComponent = getComponent(entity, EquipperComponent)
      const equippedComponent = getComponent(equipperComponent.equippedEntity, EquippedComponent)
      const attachmentPoint = equippedComponent.attachmentPoint
      const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
      const handTransform = getHandTransform(entity, getParity(attachmentPoint))
      const { position, rotation } = handTransform
      equippableTransform.position.copy(position)
      equippableTransform.rotation.copy(rotation)
    }

    for (const entity of equippableQuery.exit()) {
      const equipperComponent = getComponent(entity, EquipperComponent, true)
      const equippedEntity = equipperComponent.equippedEntity
      const equippedComponent = getComponent(equippedEntity, EquippedComponent)
      const attachmentPoint = equippedComponent.attachmentPoint

      const equippedTransform = getComponent(equippedEntity, TransformComponent)
      const collider = getComponent(equippedEntity, ColliderComponent)
      console.log('collider:', collider)
      if (collider) {
        // collider.body.type = BodyType.DYNAMIC
        teleportRigidbody(collider.body, equippedTransform.position, equippedTransform.rotation)
      }

      // send unequip to clients
      dispatchFrom(Engine.userId, () =>
        NetworkWorldAction.setEquippedObject({
          userId: Engine.userId,
          networkId: getComponent(equippedEntity, NetworkObjectComponent).networkId,
          attachmentPoint: attachmentPoint,
          equip: false
        })
      )

      removeComponent(equippedEntity, EquippedComponent)
    }
  }
}
