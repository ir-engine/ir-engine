import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent, removeEntity } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { spawnPrefab } from '../functions/spawnPrefab'
import { ECSWorld } from '../../ecs/classes/World'
import { NetworkWorldActions, NetworkWorldActionType } from '../interfaces/NetworkWorldActions'

/**
 * Apply State received over the network to the client.
 * @param worldStateBuffer State of the world received over the network.
 * @param delta Time since last frame.
 */

function searchSameInAnotherId(objectToCreate) {
  return Object.keys(Network.instance.networkObjects)
    .map(Number)
    .find((key) => Network.instance.networkObjects[key]?.uniqueId === objectToCreate.uniqueId)
}

function syncNetworkObjectsTest(objectToCreate) {
  if (!Network.instance.networkObjects[objectToCreate.networkId]) return
  if (objectToCreate.uniqueId === Network.instance.networkObjects[objectToCreate.networkId]?.uniqueId) return

  Object.keys(Network.instance.networkObjects)
    .map(Number)
    .forEach((key) => {
      if (Network.instance.networkObjects[key].entity == null) {
        console.warn('TRY RESTART SERVER, MAYBE ON SERVER DONT CREATE THIS LOCATION')
      }
      if (Network.instance.networkObjects[key].uniqueId === objectToCreate.uniqueId) {
        console.warn(
          '*createObjects* Correctiong networkObjects as a server id: ' +
            objectToCreate.networkId +
            ' and we now have id: ' +
            key
        )
        const tempCorrect = Network.instance.networkObjects[key]
        const tempMistake = Network.instance.networkObjects[objectToCreate.networkId]
        Network.instance.networkObjects[key] = tempMistake
        Network.instance.networkObjects[objectToCreate.networkId] = tempCorrect
        getComponent(Network.instance.networkObjects[key].entity, NetworkObjectComponent).networkId = key
        getComponent(
          Network.instance.networkObjects[objectToCreate.networkId].entity,
          NetworkObjectComponent
        ).networkId = objectToCreate.networkId
      }
    })
}

function syncPhysicsObjects(objectToCreate) {
  if (
    Object.keys(Network.instance.networkObjects)
      .map(Number)
      .every((key) => Network.instance.networkObjects[key].uniqueId != objectToCreate.uniqueId)
  ) {
    Object.keys(Network.instance.networkObjects)
      .map(Number)
      .forEach((key) => {
        if (key === Number(objectToCreate.networkId)) {
          const tempCorrect = Network.instance.networkObjects[key]
          Network.instance.networkObjects[key] = undefined
          const newId = Network.getNetworkId()
          Network.instance.networkObjects[newId] = tempCorrect
          getComponent(Network.instance.networkObjects[newId].entity, NetworkObjectComponent).networkId = newId
        }
      })
  }
}

export const clientNetworkReceptor = (world: ECSWorld, action: NetworkWorldActionType) => {
  console.log('clientNetworkReceptor', action)
  switch (action.type) {
    case NetworkWorldActions.CREATE_CLIENT: {
      if (!Network.instance.clients[action.userId])
        Network.instance.clients[action.userId] = {
          userId: action.userId,
          avatarDetail: action.avatarDetail,
          subscribedChatUpdates: []
        }
      break
    }

    case NetworkWorldActions.DESTROY_CLIENT: {
      delete Network.instance.clients[action.userId].userId
      break
    }

    case NetworkWorldActions.CREATE_OBJECT: {
      if (!Network.instance.schema.prefabs.has(action.prefabType)) {
        console.log('prefabType not found', action.prefabType)
        break
      }

      const isIdFull = Network.instance.networkObjects[action.networkId] != undefined
      const isSameUniqueId = isIdFull && Network.instance.networkObjects[action.networkId].uniqueId === action.uniqueId

      const entityExistsInAnotherId = searchSameInAnotherId(action)

      if (isSameUniqueId) {
        console.error('[Network]: this player id already exists, please reconnect', action.networkId)
        break
      }

      if (typeof entityExistsInAnotherId !== 'undefined') {
        console.warn(
          '[Network]: Found local client in a different networkId. Was ',
          entityExistsInAnotherId,
          'now',
          action.networkId
        )

        // set existing entity to new id
        Network.instance.networkObjects[action.networkId] = Network.instance.networkObjects[entityExistsInAnotherId]

        // remove old id
        delete Network.instance.networkObjects[entityExistsInAnotherId]

        // change network component id
        getComponent(Network.instance.networkObjects[action.networkId].entity, NetworkObjectComponent).networkId =
          action.networkId

        break
      }

      if (isIdFull) {
        console.warn('[Network]: creating an object with an existing newtorkId...', action.networkId)
        syncPhysicsObjects(action)
      }

      if (Network.instance.networkObjects[action.networkId] === undefined) {
        spawnPrefab(action.prefabType, action.uniqueId, action.networkId, action.parameters)
      }
      syncNetworkObjectsTest(action)
      break
    }

    case NetworkWorldActions.DESTROY_OBJECT: {
      console.log('Destroying ', action.networkId)
      if (Network.instance.networkObjects[action.networkId] === undefined) {
        console.warn("Can't destroy object as it doesn't appear to exist")
        break
      }

      if (getComponent(Network.instance.localClientEntity, NetworkObjectComponent).networkId === action.networkId) {
        console.warn('Can not remove owner...')
        break
      }
      const entity = Network.instance.networkObjects[action.networkId].entity
      // Remove the entity and all of it's components
      removeEntity(entity)
      // Remove network object from list
      delete Network.instance.networkObjects[action.networkId]
      break
    }
  }
}
