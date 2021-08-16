import { isClient } from '../../common/functions/isClient'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippedStateUpdateSchema } from '../enums/EquippedEnums'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { NetworkObjectUpdateType } from '../../networking/templates/NetworkObjectUpdates'
import { sendClientObjectUpdate } from '../../networking/functions/sendClientObjectUpdate'
import { BodyType } from 'three-physx'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { defineQuery, defineSystem, enterQuery, exitQuery, Not, System } from '../../ecs/bitecs'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { LocalInputReceiverComponent } from '../../input/components/LocalInputReceiverComponent'
import { ECSWorld } from '../../ecs/classes/World'

/**
 * @author Josh Field <github.com/HexaField>
 */

export const EquippableSystem = async (): Promise<System> => {
  const networkUserQuery = defineQuery([Not(LocalInputReceiverComponent), AvatarComponent, TransformComponent])
  const networkUserAddQuery = enterQuery(networkUserQuery)

  const equippableQuery = defineQuery([EquipperComponent])
  const equippableAddQuery = enterQuery(equippableQuery)
  const equippableRemoveQuery = exitQuery(equippableQuery)

  return defineSystem((world: ECSWorld) => {
    for (const entity of equippableAddQuery(world)) {
      const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
      // all equippables must have a collider to grab by in VR
      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) collider.body.type = BodyType.KINEMATIC
      // send equip to clients
      if (!isClient) {
        const networkObject = getComponent(equippedEntity, NetworkObjectComponent)
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
          BinaryValue.TRUE,
          networkObject.networkId
        ] as EquippedStateUpdateSchema)
      }
    }

    for (const entity of equippableQuery(world)) {
      const equipperComponent = getComponent(entity, EquipperComponent)
      const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
      const handTransform = getHandTransform(entity)
      const { position, rotation } = handTransform
      equippableTransform.position.copy(position)
      equippableTransform.rotation.copy(rotation)
      if (!isClient) {
        for (const userEntity of networkUserAddQuery(world)) {
          const networkObject = getComponent(equipperComponent.equippedEntity, NetworkObjectComponent)
          sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
            BinaryValue.TRUE,
            networkObject.networkId
          ] as EquippedStateUpdateSchema)
        }
      }
    }

    for (const entity of equippableRemoveQuery(world)) {
      const equipperComponent = getComponent(entity, EquipperComponent, true)
      const equippedEntity = equipperComponent.equippedEntity
      const equippedTransform = getComponent(equippedEntity, TransformComponent)
      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) {
        collider.body.type = BodyType.DYNAMIC
        collider.body.updateTransform({
          translation: equippedTransform.position,
          rotation: equippedTransform.rotation
        })
      }
      // send unequip to clients
      if (!isClient) {
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
          BinaryValue.FALSE
        ] as EquippedStateUpdateSchema)
      }
    }

    return world
  })
}
