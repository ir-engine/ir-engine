import { Entity } from '../../ecs/classes/Entity'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { Network } from '../../networking/classes/Network'

import { NetworkObject } from '../../networking/components/NetworkObject'
import { Game } from '../components/Game'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GameObject } from '../components/GameObject'
import { GamePlayer } from '../components/GamePlayer'

import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  removeEntity
} from '../../ecs/functions/EntityFunctions'
import {
  initState,
  removeEntityFromState,
  saveInitStateCopy,
  requireState,
  clearRemovedEntitysFromGame
} from '../functions/functionsState'

import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { GameMode } from '../types/GameMode'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { ColliderHitEvent } from 'three-physx'
import { isClient } from '../../common/functions/isClient'
import {
  addActionComponent,
  checkIsGamePredictionStillRight,
  clearPredictionCheckList
} from '../functions/functionsActions'
import { NewPlayerTagComponent } from '../templates/Golf/components/GolfTagComponents'
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces'
import { Component } from '../../ecs/classes/Component'
import { CharacterComponent } from '../../character/components/CharacterComponent'
import { getGameFromName } from '../functions/functions'
import { Engine } from '../../ecs/classes/Engine'
import { Action } from '../types/GameComponents'

/**
 * @author HydraFire <github.com/HydraFire>
 */
/*
function checkWatchers(entity, arr) {
  return (
    arr === undefined ||
    arr.length === 0 ||
    arr.some((componentArr) => componentArr.every((component) => hasComponent(entity, component)))
  )
}

function checkCheckers(entity, entityOther, arr) {
  return arr.map((checker) => checker.function(entity, checker.args, entityOther))
}
*/
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

/**
 * @author HydraFire <github.com/HydraFire>
 */

type ComponentStateChangeType = {
  entity: Entity
  component: ComponentConstructor<Component<any>>
}

export class GameManagerSystem extends System {
  static instance: GameManagerSystem
  updateType = SystemUpdateType.Fixed

  updateNewPlayersRate: number
  updateLastTime: number
  currentGames: Map<string, Game>
  gameEntities: Entity[]

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)
    GameManagerSystem.instance = this
    this.reset()
  }

  reset(): void {
    this.updateNewPlayersRate = 60 * 5
    this.updateLastTime = 0
    this.currentGames = new Map<string, Game>()
    this.gameEntities = []
  }

  dispose(): void {
    super.dispose()
    this.reset()
  }

  execute(delta: number, time: number): void {
    for (const entity of this.queryResults.game.added) {
      const game = getMutableComponent(entity, Game)
      const gameSchema = Engine.gameModes[game.gameMode] as GameMode
      gameSchema.preparePlayersRole(gameSchema, game.maxPlayers)
      game.priority = gameSchema.priority // DOTO: set its from editor
      initState(game, gameSchema)
      this.gameEntities.push(entity)
      // its for client, to get game entity whan came Action Message with only name of Game
      this.currentGames.set(game.name, game)
      // TODO: add start & stop functions to be able to start and end games
      gameSchema.onGameStart(entity)
      console.log('CREATE GAME')
    }

    for (const entity of this.queryResults.gameObjectCollisions.all) {
      const collider = getComponent(entity, ColliderComponent)
      const gameObject = getComponent(entity, GameObject)
      for (const collisionEvent of collider.body?.collisionEvents) {
        const otherEntity = collisionEvent.bodyOther.userData as Entity
        if (typeof otherEntity === 'undefined') continue
        const otherGameObject = getComponent<GameObject>(otherEntity, GameObject)
        if (!otherGameObject) continue
        Object.keys(gameObject.collisionBehaviors).forEach((role) => {
          if (role === otherGameObject.role) {
            gameObject.collisionBehaviors[role](entity, delta, { hitEvent: collisionEvent }, otherEntity)
          }
        })
      }
    }

    for (const entityGame of this.queryResults.game.all) {
      const game = getComponent(entityGame, Game)
      // this part about check if client get same actions as server send him.
      if (isClient && game.isGlobal && checkIsGamePredictionStillRight()) {
        clearPredictionCheckList()
        requireState(
          game,
          getComponent(
            Network.instance.networkObjects[Network.instance.localAvatarNetworkId].component.entity,
            GamePlayer
          )
        )
      }

      for (const entity of this.queryResults.characters.added) {
        console.log('new client joining game')
        addComponent(entity, NewPlayerTagComponent, { gameName: game.name })
      }
      /*
      for(const entity of this.queryResults.characters.removed) {
        hasComponent(entity, NewPlayerTagComponent) && removeComponent(entity, NewPlayerTagComponent)
        hasComponent(entity, GamePlayer) && removeComponent(entity, GamePlayer)
      })
      */
    }

    // PLAYERS REMOVE
    for (const entity of this.queryResults.gamePlayer.removed) {
      for (const entityGame of this.queryResults.game.all) {
        const game = getComponent(entityGame, Game)
        const gamePlayer = getComponent(entity, GamePlayer, true)
        if (gamePlayer === undefined || gamePlayer.gameName != game.name) continue
        const gameSchema = Engine.gameModes[game.gameMode]
        gameSchema.beforePlayerLeave(entity)
        console.log('removeEntityFromState', gamePlayer.role)
        removeEntityFromState(gamePlayer, game)
        clearRemovedEntitysFromGame(game)
        game.gamePlayers[gamePlayer.role] = []
        gameSchema.onPlayerLeave(entity, gamePlayer, game)
        /*
        Object.values(gamePlayer.ownedObjects).forEach((entityObj) => {
          removeEntity(entityObj)
        })
        
        removeEntity(entity);
        */
      }
    }

    // OBJECTS REMOVE
    for (const entity of this.queryResults.gameObject.removed) {
      for (const entityGame of this.queryResults.game.all) {
        const game = getComponent(entityGame, Game)
        const gameObject = getComponent(entity, GameObject, true)
        if (gameObject === undefined || gameObject.gameName != game.name) continue
        console.log('removeEntityFromState', gameObject.role)
        removeEntityFromState(gameObject, game)
        game.gameObjects[gameObject.role] = []
      }
    }

    // PLAYERS ADDIND
    for (const entity of this.queryResults.gamePlayer.added) {
      for (const entityGame of this.queryResults.game.all) {
        const game = getComponent(entityGame, Game)
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

    for (const entity of this.queryResults.newPlayer.added) {
      console.log('new player')
      const newPlayer = getComponent(entity, NewPlayerTagComponent)
      const gamePlayerComp = addComponent(entity, GamePlayer, {
        gameName: newPlayer.gameName,
        role: 'newPlayer',
        uuid: getComponent(entity, NetworkObject).ownerId
      })
      const game = getGameFromName(newPlayer.gameName)
      requireState(game, gamePlayerComp)
      removeComponent(entity, NewPlayerTagComponent)
    }

    // OBJECTS ADDIND
    // its needet for allow dynamicly adding objects and exept errors when enitor gives object without created game
    for (const entity of this.queryResults.gameObject.added) {
      for (const entityGame of this.queryResults.game.all) {
        const game = getComponent(entityGame, Game)
        if (getComponent(entity, GameObject).gameName != game.name) continue

        const gameObjects = game.gameObjects
        // add to gameObjects list sorted by role
        gameObjects[getComponent(entity, GameObject).role].push(entity)
      }
    }

    // end of execute
  }
}
/*
for(const entity of this.queryResults.gameObject.removed?.forEach(entity => {
  removeFromGame(entity);
  removeFromState(entity);
  console.warn('ONE OBJECT REMOVED');
});
*/
GameManagerSystem.queries = {
  characters: {
    components: [CharacterComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  newPlayer: {
    components: [NewPlayerTagComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  game: {
    components: [Game],
    listen: {
      added: true,
      removed: true
    }
  },
  gameObject: {
    components: [GameObject],
    listen: {
      added: true,
      removed: true
    }
  },
  gameObjectCollisions: {
    components: [GameObject, ColliderComponent]
  },
  gamePlayer: {
    components: [GamePlayer],
    listen: {
      added: true,
      removed: true
    }
  }
}
