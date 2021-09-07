import { isClient } from '../../common/functions/isClient'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EquipperComponent } from '../components/EquipperComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { BodyType } from 'three-physx'
import { getHandTransform } from '../../xr/functions/WebXRFunctions'
import { defineQuery, defineSystem, enterQuery, exitQuery, Not, System } from 'bitecs'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { ECSWorld } from '../../ecs/classes/World'
import { dispatchFromServer } from '../../networking/functions/dispatch'
import {
  NetworkWorldActions,
  NetworkWorldAction,
  NetworkWorldActionType
} from '../../networking/interfaces/NetworkWorldActions'
import { Network } from '../../networking/classes/Network'
import { equipEntity, unequipEntity } from '../functions/equippableFunctions'

/**
 * @author Josh Field <github.com/HexaField>
 */

export const EquippableSystem = async (): Promise<System> => {
  const networkUserQuery = defineQuery([Not(LocalInputTagComponent), AvatarComponent, TransformComponent])
  const networkUserAddQuery = enterQuery(networkUserQuery)

  const equippableQuery = defineQuery([EquipperComponent])
  const equippableAddQuery = enterQuery(equippableQuery)
  const equippableRemoveQuery = exitQuery(equippableQuery)

  function equippableActionReceptor(world: ECSWorld, action: NetworkWorldActionType) {
    switch (action.type) {
      case NetworkWorldActions.EQUIP_OBJECT: {
        if (!Network.instance.networkObjects[action.equippedNetworkId])
          return console.warn(
            `Equipper entity with id ${action.equippedNetworkId} does not exist! You should probably reconnect...`
          )

        const entityEquipper = Network.instance.networkObjects[action.equipperNetworkId].entity

        if (action.equip) {
          // we only care about equipping if we are the user doing so, otherwise network transforms take care of it
          if (!Network.instance.networkObjects[action.equippedNetworkId])
            return console.warn(
              `Equipped entity with id ${action.equippedNetworkId} does not exist! You should probably reconnect...`
            )
          const entityEquipped = Network.instance.networkObjects[action.equippedNetworkId].entity
          equipEntity(entityEquipper, entityEquipped)
        } else {
          unequipEntity(entityEquipper)
        }
      }
    }
  }

  return defineSystem((world: ECSWorld) => {
    for (const action of Network.instance.incomingActions) equippableActionReceptor(world, action as any)

    for (const entity of equippableAddQuery(world)) {
      const equippedEntity = getComponent(entity, EquipperComponent).equippedEntity
      // all equippables must have a collider to grab by in VR
      const collider = getComponent(equippedEntity, ColliderComponent)
      if (collider) collider.body.type = BodyType.KINEMATIC
      // send equip to clients
      if (!isClient) {
        const equippedNetworkObject = getComponent(equippedEntity, NetworkObjectComponent)
        const equipperNetworkObject = getComponent(entity, NetworkObjectComponent)
        dispatchFromServer(
          NetworkWorldAction.equipObject(equipperNetworkObject.networkId, equippedNetworkObject.networkId, true)
        )
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
          const equippedNetworkObject = getComponent(equipperComponent.equippedEntity, NetworkObjectComponent)
          const equipperNetworkObject = getComponent(entity, NetworkObjectComponent)
          dispatchFromServer(
            NetworkWorldAction.equipObject(equipperNetworkObject.networkId, equippedNetworkObject.networkId, true)
          )
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
        const equippedNetworkObject = getComponent(equippedEntity, NetworkObjectComponent)
        const equipperNetworkObject = getComponent(entity, NetworkObjectComponent)
        dispatchFromServer(
          NetworkWorldAction.equipObject(equipperNetworkObject.networkId, equippedNetworkObject.networkId, false)
        )
      }
    }

    return world
  })
}
