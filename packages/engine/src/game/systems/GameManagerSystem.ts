import { Entity } from '../../ecs/classes/Entity'
import { Network } from '../../networking/classes/Network'

import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { GameComponent, GameComponentType } from '../components/Game'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GameObject, GameObjectType } from '../components/GameObject'
import { GamePlayer } from '../components/GamePlayer'

import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { initState, removeEntityFromState, saveInitStateCopy, requireState } from '../functions/functionsState'

import { GameMode } from '../types/GameMode'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { isClient } from '../../common/functions/isClient'
import { checkIsGamePredictionStillRight, clearPredictionCheckList } from '../functions/functionsActions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import {
  Component,
  ComponentType,
  defineQuery,
  defineSystem,
  enterQuery,
  exitQuery,
  IComponent,
  System
} from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'

// TODO: add game areas back
function isPlayerInGameArea(entity, gameArea) {
  const p = getComponent(entity, TransformComponent).position
  const inGameArea =
    p.x < gameArea.max.x &&
    p.x > gameArea.min.x &&
    p.y < gameArea.max.y &&
    p.y > gameArea.min.y &&
    p.z < gameArea.max.z &&
    p.z > gameArea.min.z
  return { entity, inGameArea }
}

export class ActiveGames {
  static instance = new ActiveGames()
  currentGames: Map<string, ReturnType<typeof GameComponent.get>> = new Map()
  gameEntities: Entity[] = []
}

/**
 * @author HydraFire <github.com/HydraFire>
 */
export const GameManagerSystem = async (): Promise<System> => {
  const avatarsQuery = defineQuery([AvatarComponent])
  const avatarsAddQuery = enterQuery(avatarsQuery)

  const gameQuery = defineQuery([GameComponent])
  const gameAddQuery = enterQuery(gameQuery)

  const gameObjectQuery = defineQuery([GameObject])
  const gameObjectAddQuery = enterQuery(gameObjectQuery)
  const gameObjectRemoveQuery = exitQuery(gameObjectQuery)

  const gameObjectCollisionsQuery = defineQuery([GameObject, ColliderComponent])

  const gamePlayerQuery = defineQuery([GamePlayer])
  const gamePlayerAddQuery = enterQuery(gamePlayerQuery)
  const gamePlayerRemoveQuery = exitQuery(gamePlayerQuery)

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    const gameQueryResults = gameQuery(world)

    for (const entity of gameAddQuery(world)) {
      const game = getComponent(entity, GameComponent)
      const gameSchema = Engine.gameModes.get(game.gameMode)
      gameSchema.preparePlayersRole(gameSchema, game.maxPlayers)
      game.priority = gameSchema.priority // DOTO: set its from editor
      initState(game, gameSchema)
      ActiveGames.instance.gameEntities.push(entity)
      // its for client, to get game entity whan came Action Message with only name of Game
      ActiveGames.instance.currentGames.set(game.name, game)
      // TODO: add start & stop functions to be able to start and end games
      gameSchema.onGameStart(entity)
      console.log('CREATE GAME')
    }

    for (const entity of gameObjectCollisionsQuery(world)) {
      const collider = getComponent(entity, ColliderComponent)
      const gameObject = getComponent(entity, GameObject)
      for (const collisionEvent of collider.body.collisionEvents) {
        const otherEntity = collisionEvent.bodyOther.userData.entity as Entity
        if (typeof otherEntity === 'undefined') continue
        const otherGameObject = getComponent(otherEntity, GameObject)
        if (!otherGameObject) continue
        Object.keys(gameObject.collisionBehaviors).forEach((role) => {
          if (role === otherGameObject.role) {
            gameObject.collisionBehaviors[role](entity, collisionEvent, otherEntity)
          }
        })
      }
    }

    for (const entityGame of gameQueryResults) {
      const game = getComponent(entityGame, GameComponent)
      // this part about check if client get same actions as server send him.
      if (isClient && game.isGlobal && checkIsGamePredictionStillRight()) {
        clearPredictionCheckList()
        requireState(
          game,
          getComponent(Network.instance.networkObjects[Network.instance.localAvatarNetworkId].entity, GamePlayer)
        )
      }

      for (const entity of avatarsAddQuery(world)) {
        console.log('new player')
        const gamePlayerComp = addComponent(entity, GamePlayer, {
          gameName: game.name,
          role: 'newPlayer',
          uuid: getComponent(entity, NetworkObjectComponent).ownerId,
          ownedObjects: {}
        })
        requireState(game, gamePlayerComp)
      }
    }

    // PLAYERS REMOVE
    for (const entity of gamePlayerRemoveQuery(world)) {
      for (const entityGame of gameQueryResults) {
        const game = getComponent(entityGame, GameComponent)
        const gamePlayer = getComponent(entity, GamePlayer, true)
        if (gamePlayer === undefined || gamePlayer.gameName != game.name) continue
        const gameSchema = Engine.gameModes.get(game.gameMode)
        gameSchema.beforePlayerLeave(entity)
        console.log('removeEntityFromState', gamePlayer.role)
        removeEntityFromState(gamePlayer, game)
        // clearRemovedEntitysFromGame(game)
        game.gamePlayers[gamePlayer.role] = []
        gameSchema.onPlayerLeave(entity, gamePlayer, game)
      }
    }

    // OBJECTS REMOVE
    for (const entity of gameObjectRemoveQuery(world)) {
      for (const entityGame of gameQueryResults) {
        const game = getComponent(entityGame, GameComponent)
        const gameObject = getComponent(entity, GameObject, true)
        if (gameObject === undefined || gameObject.gameName != game.name) continue
        console.log('removeEntityFromState', gameObject.role)
        removeEntityFromState(gameObject, game)
        game.gameObjects[gameObject.role] = []
      }
    }

    // PLAYERS ADDIND
    for (const entity of gamePlayerAddQuery(world)) {
      for (const entityGame of gameQueryResults) {
        const game = getComponent(entityGame, GameComponent)
        const gamePlayer = getComponent(entity, GamePlayer)
        if (gamePlayer.gameName != game.name) continue

        // befor adding first player
        const countAllPlayersInGame = Object.keys(game.gamePlayers).reduce(
          (acc, v) => acc + game.gamePlayers[v].length,
          0
        )
        if (countAllPlayersInGame == 1) saveInitStateCopy(entityGame)
        // add to gamePlayers list sorted by role
        // game.gamePlayers[gamePlayer.role].push(entity)
        requireState(game, gamePlayer)
      }
    }

    // OBJECTS ADDIND
    // its needet for allow dynamicly adding objects and exept errors when enitor gives object without created game
    for (const entity of gameObjectAddQuery(world)) {
      for (const entityGame of gameQueryResults) {
        const game = getComponent(entityGame, GameComponent)
        if (getComponent(entity, GameObject).gameName != game.name) continue

        const gameObjects = game.gameObjects
        // add to gameObjects list sorted by role
        gameObjects[getComponent(entity, GameObject).role].push(entity)
      }
    }
    return world
  })
}
