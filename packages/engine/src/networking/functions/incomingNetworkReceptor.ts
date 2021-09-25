import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { isClient } from '../../common/functions/isClient'
import { NetworkWorldAction } from './NetworkWorldAction'
import { useWorld } from '../../ecs/functions/SystemHooks'
import matches from 'ts-matches'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkObjectOwnedTag } from '../components/NetworkObjectOwnedTag'

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
export const incomingNetworkReceptor = (action) => {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.createClient.matches, ({ userId, name, avatarDetail }) => {
      if (!isClient) return
      world.clients.set(userId, {
        userId,
        name,
        avatarDetail,
        subscribedChatUpdates: []
      })
    })

    .when(NetworkWorldAction.destroyClient.matches, ({ userId }) => {
      if (!isClient) return
      for (const eid of world.getOwnedNetworkObjects(userId)) removeEntity(eid)
      world.clients.delete(userId)
    })

    .when(NetworkWorldAction.spawnObject.matches, (a) => {
      if (world.getNetworkObject(a.networkId))
        throw new Error(`Cannot spawn network object with existing network id ${a.networkId}`)
      const isSpawningAvatar = NetworkWorldAction.spawnAvatar.matches.test(a)
      const isOwnedByMe = a.userId === Engine.userId
      const entity = isSpawningAvatar && isOwnedByMe ? world.localClientEntity : createEntity()
      if (isOwnedByMe) addComponent(entity, NetworkObjectOwnedTag, {})
      addComponent(entity, NetworkObjectComponent, a)
    })

    .when(NetworkWorldAction.destroyObject.matches, (a) => {
      const entity = world.getNetworkObject(a.networkId)
      if (entity) removeEntity(entity)
    })
}
