import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { isClient } from '../../common/functions/isClient'
import { NetworkWorldAction } from './NetworkWorldAction'
import { useWorld } from '../../ecs/functions/SystemHooks'
import matches from 'ts-matches'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'
import { dispatchFrom } from './dispatchFrom'

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
export function incomingNetworkReceptor(action) {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.createClient.matches, ({ userId, name }) => {
      if (!isClient) return
      world.clients.set(userId, {
        userId,
        name,
        subscribedChatUpdates: []
      })
    })

    .when(NetworkWorldAction.joinedWorld.matchesFromAny, ({}) => {})

    .when(NetworkWorldAction.destroyClient.matches, ({ userId }) => {
      for (const eid of world.getOwnedNetworkObjects(userId)) {
        const { networkId } = getComponent(eid, NetworkObjectComponent)
        dispatchFrom(world.hostId, () => NetworkWorldAction.destroyObject({ networkId }))
      }
      if (!isClient || userId === Engine.userId) return
      world.clients.delete(userId)
    })

    .when(NetworkWorldAction.spawnObject.matches, (a) => {
      const isSpawningAvatar = NetworkWorldAction.spawnAvatar.matches.test(a)
      /**
       * When changing location via a portal, the local client entity will be
       * defined when the new world dispatches this action, so ignore it
       */
      if (
        isSpawningAvatar &&
        Engine.userId === a.userId &&
        hasComponent(world.localClientEntity, NetworkObjectComponent)
      ) {
        getComponent(world.localClientEntity, NetworkObjectComponent).networkId = a.networkId
        return
      }
      const params = a.parameters
      const isOwnedByMe = a.userId === Engine.userId
      let entity
      if (isSpawningAvatar && isOwnedByMe) {
        entity = world.localClientEntity
      } else {
        let networkObject = world.getNetworkObject(a.networkId)
        if (networkObject) {
          entity = networkObject
        } else if (params?.sceneEntityId) {
          entity = (Engine.scene.children.find((child) => (child as any).sceneEntityId === params.sceneEntityId) as any)
            .entity
        } else {
          entity = createEntity()
        }
      }
      if (isOwnedByMe) addComponent(entity, NetworkObjectOwnedTag, {})
      addComponent(entity, NetworkObjectComponent, {
        userId: a.userId,
        networkId: a.networkId,
        prefab: a.prefab,
        parameters: a.parameters
      })
    })

    .when(NetworkWorldAction.destroyObject.matches, (a) => {
      const entity = world.getNetworkObject(a.networkId)
      if (entity === world.localClientEntity) return
      if (entity) removeEntity(entity)
    })

  // .when(NetworkWorldAction.setEquippedObject.matchesFromAny, (a) => {
  //   console.log('netowrk action received in equip receptor', a)
  // })
}
