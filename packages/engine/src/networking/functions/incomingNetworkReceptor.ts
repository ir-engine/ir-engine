import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { isClient } from '../../common/functions/isClient'
import { NetworkWorldAction } from './NetworkWorldAction'
import { useWorld } from '../../ecs/functions/SystemHooks'
import matches from 'ts-matches'

/**
 * @author Gheric Speiginer <github.com/speigg>
 * @author Josh Field <github.com/HexaField>
 */
export const incomingNetworkReceptor = (action) => {
  const world = useWorld()

  matches(action)
    .when(NetworkWorldAction.createClient.matches, ({ userId, avatarDetail }) => {
      if (!Network.instance.clients[userId]) {
        Network.instance.clients[userId] = {
          userId,
          avatarDetail,
          subscribedChatUpdates: []
        }
      }
    })

    .when(NetworkWorldAction.destroyClient.matches, ({ userId }) => {
      for (const eid of world.getOwnedNetworkObjects(userId)) removeEntity(eid)
      if (!isClient) return // TODO: why?
      delete Network.instance.clients[userId].userId
    })

    .when(NetworkWorldAction.spawnObject.matches, (a) => {
      if (world.getNetworkObject(a.networkId))
        throw new Error(`Cannot spawn network object with existing network id ${a.networkId}`)
      const entity = createEntity()
      addComponent(entity, NetworkObjectComponent, a)
    })

    .when(NetworkWorldAction.destroyObject.matches, (a) => {
      const entity = world.getNetworkObject(a.networkId)
      if (entity) removeEntity(entity)
    })
}
