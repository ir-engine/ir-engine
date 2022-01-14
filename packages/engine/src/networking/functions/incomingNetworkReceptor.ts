import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { isClient } from '../../common/functions/isClient'
import { NetworkWorldAction } from './NetworkWorldAction'
import { useWorld } from '../../ecs/functions/SystemHooks'
import matches from 'ts-matches'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { dispatchLocal } from './dispatchFrom'

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
export function incomingNetworkReceptor(action) {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.createClient.matches, ({ $from, name }) => {
      if (!isClient) return
      world.clients.set($from, {
        userId: $from,
        name,
        subscribedChatUpdates: []
      })
    })

    .when(NetworkWorldAction.destroyClient.matches, ({ $from }) => {
      if (!isClient) return
      for (const eid of world.getOwnedNetworkObjects($from)) {
        const { networkId } = getComponent(eid, NetworkObjectComponent)
        dispatchLocal(NetworkWorldAction.destroyObject({ $from, networkId }))
      }
      if (!isClient || $from === Engine.userId) return
      world.clients.delete($from)
    })

    .when(NetworkWorldAction.spawnObject.matches, (a) => {
      const isSpawningAvatar = NetworkWorldAction.spawnAvatar.matches.test(a)
      /**
       * When changing location via a portal, the local client entity will be
       * defined when the new world dispatches this action, so ignore it
       */
      if (
        isSpawningAvatar &&
        Engine.userId === a.$from &&
        hasComponent(world.localClientEntity, NetworkObjectComponent)
      ) {
        getComponent(world.localClientEntity, NetworkObjectComponent).networkId = a.networkId
        return
      }
      const params = a.parameters
      const isOwnedByMe = a.$from === Engine.userId
      let entity
      if (isSpawningAvatar && isOwnedByMe) {
        entity = world.localClientEntity
      } else {
        let networkObject = world.getNetworkObject(a.$from, a.networkId)
        if (networkObject) {
          entity = networkObject
        } else if (params?.sceneEntityId) {
          const node = world.entityTree.findNodeFromUUID(params.sceneEntityId)
          if (node) entity = node.entity
        } else {
          entity = createEntity()
        }
      }
      if (isOwnedByMe) addComponent(entity, NetworkObjectOwnedTag, {})

      addComponent(entity, NetworkObjectComponent, {
        ownerId: a.$from,
        networkId: a.networkId,
        prefab: a.prefab,
        parameters: a.parameters
      })
    })

    .when(NetworkWorldAction.destroyObject.matches, (a) => {
      const entity = world.getNetworkObject(a.$from, a.networkId)
      if (entity === world.localClientEntity) return
      if (entity) removeEntity(entity)
    })

  // .when(NetworkWorldAction.setEquippedObject.matchesFromAny, setEquippedObjectReceptor)
}

// export function setEquippedObjectReceptor(a: any) {
// const world = useWorld()
// let entity = world.getNetworkObject(a.object.ownerId, a.object.networkId)
// if (entity) {
//   if (a.$from === Engine.userId) {
//     if (a.equip) {
//       if (!hasComponent(entity, NetworkObjectOwnedTag)) {
//         addComponent(entity, NetworkObjectOwnedTag, {})
//       }
//     } else {
//       removeComponent(entity, NetworkObjectOwnedTag)
//     }
//   } else {
//     removeComponent(entity, NetworkObjectOwnedTag)
//   }

//   // Give ownership back to server, so that item shows up where it was last dropped
//   if (Engine.userId === world.hostId && !a.equip) {
//     addComponent(entity, NetworkObjectOwnedTag, {})
//   }
// }
// }
