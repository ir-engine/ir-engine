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
import { getEntityComponents } from 'bitecs'
import { WorldScene } from '../../scene/functions/SceneLoading'

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
export function incomingNetworkReceptor(action) {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.createClient.matches, ({ userId, name, avatarDetail }) => {
      console.log('create client')
      if (!isClient) return
      world.clients.set(userId, {
        userId,
        name,
        avatarDetail,
        subscribedChatUpdates: []
      })
    })

    .when(NetworkWorldAction.destroyClient.matches, ({ userId }) => {
      for (const eid of world.getOwnedNetworkObjects(userId)) {
        const { networkId } = getComponent(eid, NetworkObjectComponent)
        dispatchFrom(world.hostId, () => NetworkWorldAction.destroyObject({ networkId }))
      }
      if (!isClient || userId === Engine.userId) return
      world.clients.delete(userId)
    })

    .when(NetworkWorldAction.spawnObject.matches, (a) => {
      console.log('Spawning object: ', a)
      const isSpawningAvatar = NetworkWorldAction.spawnAvatar.matches.test(a)
      console.log(isSpawningAvatar)
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
      const isOwnedByMe = a.userId === Engine.userId
      let entity
      if (isSpawningAvatar && isOwnedByMe) {
        console.log('local client entity')
        entity = world.localClientEntity
      } else {
        let networkObject = world.getNetworkObject(a.networkId)
        if (networkObject) {
          console.log('network object: ', networkObject)
          entity = networkObject
        } else {
          entity = createEntity()
          console.log('create entity, ', entity)

          let params = a.parameters
          console.log(params)
          if (params.sceneEntity) {
            let sceneEntity = params.sceneEntity
            console.log('scene entity received in network action', sceneEntity)
            WorldScene.loadComponentLate(entity, sceneEntity)
          }
        }
      }
      console.log(isOwnedByMe)
      if (isOwnedByMe) addComponent(entity, NetworkObjectOwnedTag, {})
      addComponent(entity, NetworkObjectComponent, a)
      let components = getEntityComponents(world, entity)
      console.log(components)
    })

    .when(NetworkWorldAction.destroyObject.matches, (a) => {
      const entity = world.getNetworkObject(a.networkId)
      if (entity === world.localClientEntity) return
      if (entity) removeEntity(entity)
    })

    .when(NetworkWorldAction.setEquippedObject.matchesFromAny, (a) => {
      console.log('netowrk action received in equip receptor', a)
    })
}
