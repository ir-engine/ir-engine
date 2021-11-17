import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { System } from '../../ecs/classes/System'
import { Not } from 'bitecs'
import { World } from '../../ecs/classes/World'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import matches from 'ts-matches'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { teleportRigidbody } from '../../physics/functions/teleportRigidbody'

function equippableActionReceptor(action) {
  matches(action).when(NetworkWorldAction.setEquippedObject.matches, (a) => {
    // const world = useWorld()
    // // const equipper = world.getUserAvatarEntity(a.$userId)
    // // const equipped = world.getNetworkObject(a.$userId, a.networkId)
    // if (!equipped) {
    //   return console.warn(
    //     `Equipped entity with id ${equipped} does not exist! You should probably reconnect...`
    //   )
    // }
    // if (a.equip) {
    //   equipEntity(equipper, equipped)
    // } else {
    //   unequipEntity(equipper)
    // }
  })
}

/**
 * @author Josh Field <github.com/HexaField>
 */
export default async function EquippableSystem(world: World): Promise<System> {
  world.receptors.push(equippableActionReceptor)

  const networkUserQuery = defineQuery([Not(LocalInputTagComponent), AvatarComponent, TransformComponent])
  const equippableQuery = defineQuery([EquipperComponent])

  return () => {
    for (const entity of equippableQuery.enter()) {
      const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
      const collider = getComponent(equippedEntity, ColliderComponent)
      // if (collider) collider.body.type = BodyType.KINEMATIC
      // send equip to clients
      console.log('send equip to clients')
      dispatchFrom(world.hostId, () =>
        NetworkWorldAction.setEquippedObject({
          networkId: getComponent(equippedEntity, NetworkObjectComponent).networkId,
          equip: true
        })
      )
    }

    for (const entity of equippableQuery()) {
      console.log('equipping loop')
      const equipperComponent = getComponent(entity, EquipperComponent)
      const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
      const handTransform = getHandTransform(entity)
      const { position, rotation } = handTransform
      equippableTransform.position.copy(position)
      equippableTransform.rotation.copy(rotation)
    }

    for (const entity of equippableQuery.exit()) {
      const equipperComponent = getComponent(entity, EquipperComponent, true)
      const equippedEntity = equipperComponent.equippedEntity
      const equippedTransform = getComponent(equippedEntity, TransformComponent)
      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) {
        // collider.body.type = BodyType.DYNAMIC
        teleportRigidbody(collider.body, equippedTransform.position, equippedTransform.rotation)
      }
      console.log('send un equip to clients')
      // send unequip to clients
      dispatchFrom(world.hostId, () =>
        NetworkWorldAction.setEquippedObject({
          networkId: getComponent(equippedEntity, NetworkObjectComponent).networkId,
          equip: false
        })
      )
    }
  }
}
