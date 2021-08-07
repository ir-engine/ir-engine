import { isClient } from '../../common/functions/isClient'
import { System } from '../../ecs/classes/System'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { EquippedStateUpdateSchema } from '../enums/EquippedEnums'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { NetworkObjectUpdateType } from '../../networking/templates/NetworkObjectUpdates'
import { sendClientObjectUpdate } from '../../networking/functions/sendClientObjectUpdate'
import { BodyType } from 'three-physx'
import { BinaryValue } from '../../common/enums/BinaryValue'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'

/**
 * @author Josh Field <github.com/HexaField>
 */

export class EquippableSystem extends System {
  execute(delta: number, time: number): void {
    for (const entity of this.queryResults.equippable.added) {
      const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
      // all equippables must have a collider to grab by in VR
      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) collider.body.type = BodyType.KINEMATIC
      // send equip to clients
      if (!isClient) {
        const networkObject = getComponent(equippedEntity, NetworkObject)
        sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
          BinaryValue.TRUE,
          networkObject.networkId
        ] as EquippedStateUpdateSchema)
      }
    }

    for (const entity of this.queryResults.equippable.all) {
      const equipperComponent = getComponent(entity, EquipperComponent)
      const equippableTransform = getComponent(equipperComponent.equippedEntity, TransformComponent)
      const handTransform = getHandTransform(entity)
      const { position, rotation } = handTransform
      equippableTransform.position.copy(position)
      equippableTransform.rotation.copy(rotation)
      if (!isClient) {
        for (const userEntity of this.queryResults.network_user.added) {
          const networkObject = getComponent(equipperComponent.equippedEntity, NetworkObject)
          sendClientObjectUpdate(entity, NetworkObjectUpdateType.ObjectEquipped, [
            BinaryValue.TRUE,
            networkObject.networkId
          ] as EquippedStateUpdateSchema)
        }
      }
    }

    for (const entity of this.queryResults.equippable.removed) {
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
  }

  static queries: any = {
    equippable: {
      components: [EquipperComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
