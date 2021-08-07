import { isClient } from '../../common/functions/isClient'
import { Component } from '../../ecs/classes/Component'
import { Entity } from '../../ecs/classes/Entity'
import { Network } from '../../networking/classes/Network'
import { ActiveGames, GameManagerSystem } from '../../game/systems/GameManagerSystem'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  removeEntity
} from '../../ecs/functions/EntityFunctions'

import { Game } from '../components/Game'
import { GameObject } from '../components/GameObject'
import { GamePlayer } from '../components/GamePlayer'
import { NetworkObject } from '../../networking/components/NetworkObject'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const isOwnedLocalPlayer = (entity: Entity): boolean => {
  if (!hasComponent(entity, NetworkObject)) return false
  const localPlayerOwnerId = Network.instance.networkObjects[Network.instance.localAvatarNetworkId].component.ownerId
  const objectOwnerId = getComponent(entity, NetworkObject).ownerId
  return localPlayerOwnerId === objectOwnerId
}

export const getGameEntityFromName = (name: string): Entity => {
  if (name === undefined) return
  return ActiveGames.instance.gameEntities.find((entity) => getComponent(entity, Game).name === name)
}

export const getGameFromName = (name: string): Game => {
  if (name === undefined) return
  return ActiveGames.instance.currentGames.get(name)
}

export const getEntityFromRoleUuid = (game: Game, role: string, uuid: string): Entity =>
  (game.gameObjects[role] || game.gamePlayers[role]).find((entity) => getUuid(entity) === uuid)

export const getEntityArrFromRole = (game: Game, role: string): Array<Entity> =>
  game.gameObjects[role] || game.gamePlayers[role]

export const getRole = (entity: Entity) => {
  return hasComponent(entity, GameObject)
    ? getComponent(entity, GameObject).role
    : hasComponent(entity, GamePlayer)
    ? getComponent(entity, GamePlayer).role
    : undefined
}
export const setRole = (entity: Entity, newGameRole: string) => {
  return hasComponent(entity, GameObject)
    ? (getMutableComponent(entity, GameObject).role = newGameRole)
    : hasComponent(entity, GamePlayer)
    ? (getMutableComponent(entity, GamePlayer).role = newGameRole)
    : undefined
}

export const getGame = (entity: Entity): Game => {
  const name = hasComponent(entity, GameObject)
    ? getComponent(entity, GameObject).gameName
    : hasComponent(entity, GamePlayer)
    ? getComponent(entity, GamePlayer).gameName
    : undefined
  return getGameFromName(name)
}
export const getUuid = (entity: Entity) => {
  return hasComponent(entity, GameObject)
    ? getComponent(entity, GameObject).uuid
    : hasComponent(entity, GamePlayer)
    ? getComponent(entity, GamePlayer).uuid
    : undefined
}

export const getTargetEntitys = (entity: Entity, entityTarget: Entity, args: any): Entity | Entity[] => {
  if (args === undefined || args.on === undefined || args.on === 'self') {
    return entity
  } else if (args.on === 'target') {
    return entityTarget
  } else if (checkRolesNames(entity, args.on)) {
    const game = getGame(entity)
    return getEntityArrFromRole(game, args.on)
  }
}

export const getTargetEntity = (entity: Entity, entityTarget: Entity, args: any): Entity => {
  return args?.on === 'target' ? entityTarget : entity
}

export const checkRolesNames = (entity: Entity, str: string) => {
  const game = getGame(entity)
  return Object.keys(game.gameObjects)
    .concat(Object.keys(game.gamePlayers))
    .find((v) => v === str)
}
// remove all objects who has owned id like entity in parameters
export const removeSpawnedObjects = (entity: Entity, playerComponent, game) => {
  const userUuId = playerComponent.uuid

  if (!isClient && game.isGlobal) {
    Object.keys(Network.instance.networkObjects).forEach((key: string) => {
      const networkObject = Network.instance.networkObjects[key]
      // Validate that the object belonged to disconnecting user
      if (networkObject.ownerId !== userUuId) return
      if (networkObject.uniqueId === userUuId) return
      // If it does, tell clients to destroy it
      Network.instance.worldState.destroyObjects.push({ networkId: networkObject.component.networkId })
      // get network object
      const entityObject = Network.instance.networkObjects[key].component.entity
      // Remove the entity and all of it's components
      removeEntity(entityObject)
      // Remove network object from list
      delete Network.instance.networkObjects[key]
    })
  }
}
