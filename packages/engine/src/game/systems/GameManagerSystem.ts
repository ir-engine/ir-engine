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
import { initState, removeEntityFromState, saveInitStateCopy, requireState } from '../functions/functionsState'

import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { GameMode } from '../types/GameMode'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { ColliderHitEvent } from 'three-physx'
import { isClient } from '../../common/functions/isClient'
import { addActionComponent, checkIsGamePredictionStillRight, clearPredictionCheckList } from '../functions/functionsActions'
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
    this.queryResults.game.added?.forEach((entity) => {
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
    })

    this.queryResults.gameObjectCollisions?.all?.forEach((entity) => {
      const collider = getComponent(entity, ColliderComponent)
      const gameObject = getComponent(entity, GameObject)
      collider.body?.collisionEvents?.forEach((collisionEvent: ColliderHitEvent) => {
        const otherEntity = collisionEvent.bodyOther.userData as Entity
        if (typeof otherEntity === 'undefined') return;
        const otherGameObject = getComponent<GameObject>(otherEntity, GameObject)
        if (!otherGameObject) return
        Object.keys(gameObject.collisionBehaviors).forEach((role) => {
          if (role === otherGameObject.role) {
            gameObject.collisionBehaviors[role](entity, delta, { hitEvent: collisionEvent }, otherEntity)
          }
        })
      })
    })

    this.queryResults.game.all?.forEach((entityGame) => {
      const game = getComponent(entityGame, Game)
      const gameArea = game.gameArea
      
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
      
      this.queryResults.characters.added.forEach((entity) => {
        console.log('new client joining game')
        addComponent(entity, NewPlayerTagComponent, { gameName: game.name })
      })

      this.queryResults.characters.removed.forEach((entity) => {
        hasComponent(entity, NewPlayerTagComponent) && removeComponent(entity, NewPlayerTagComponent)
        hasComponent(entity, GamePlayer) && removeComponent(entity, GamePlayer)
      })
    })

    // PLAYERS REMOVE
    this.queryResults.gamePlayer.removed?.forEach((entity) => {
      this.queryResults.game.all?.forEach((entityGame) => {
        const game = getComponent(entityGame, Game)
        const gamePlayer = getComponent(entity, GamePlayer, true)
        if (gamePlayer === undefined || gamePlayer.gameName != game.name) return
        const gameSchema = Engine.gameModes[game.gameMode]
        gameSchema.beforePlayerLeave(entity)
        console.log('removeEntityFromState', gamePlayer.role)
        removeEntityFromState(gamePlayer, game)
        // clearRemovedEntitysFromGame(game)
        Object.values(gamePlayer.ownedObjects).forEach((entityObj) => {
          removeEntity(entityObj)
        })
        game.gamePlayers[gamePlayer.role] = []
        gameSchema.onPlayerLeave(entity, gamePlayer, game)
        removeEntity(entity);
      })
    })

    // OBJECTS REMOVE
    this.queryResults.gameObject.removed?.forEach((entity) => {
      this.queryResults.game.all?.forEach((entityGame) => {
        const game = getComponent(entityGame, Game)
        const gameObject = getComponent(entity, GameObject, true)
        if (gameObject === undefined || gameObject.gameName != game.name) return
        console.log('removeEntityFromState', gameObject.role)
        removeEntityFromState(gameObject, game)
        game.gameObjects[gameObject.role] = []
      })
    })
    // PLAYERS ADDIND
    this.queryResults.gamePlayer.added?.forEach((entity) => {
      this.queryResults.game.all?.forEach((entityGame) => {
        const game = getComponent(entityGame, Game)
        const gamePlayer = getComponent(entity, GamePlayer)
        if (gamePlayer.gameName != game.name) return

        // befor adding first player
        const countAllPlayersInGame = Object.keys(game.gamePlayers).reduce(
          (acc, v) => acc + game.gamePlayers[v].length,
          0
        )
        if (countAllPlayersInGame == 1) saveInitStateCopy(entityGame)
        // add to gamePlayers list sorted by role
        // game.gamePlayers[gamePlayer.role].push(entity)
        requireState(game, gamePlayer)
      })
    })

    // OBJECTS ADDIND
    // its needet for allow dynamicly adding objects and exept errors when enitor gives object without created game
    this.queryResults.gameObject.added?.forEach((entity) => {
      this.queryResults.game.all?.forEach((entityGame) => {
        const game = getComponent(entityGame, Game)
        if (getComponent(entity, GameObject).gameName != game.name) return

        const gameObjects = game.gameObjects
        // add to gameObjects list sorted by role
        gameObjects[getComponent(entity, GameObject).role].push(entity)
      })
    })

    this.queryResults.newPlayer.added.forEach((entity) => {
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
    })

    // end of execute
  }
}
/*
this.queryResults.gameObject.removed?.forEach(entity => {
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
