import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentConstructor,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'

import { GamePlayer } from '../components/GamePlayer'
import { GameComponent } from '../components/Game'
import { GameObject } from '../components/GameObject'
import { ClientActionToServer } from '../templates/DefaultGameStateAction'
import { GolfClubComponent } from '../templates/Golf/components/GolfClubComponent'
import { GolfState } from '../templates/Golf/GolfGameComponents'

import { SpawnedObject, State } from '../types/GameComponents'
import { ClientGameActionMessage, GameStateUpdateMessage } from '../types/GameMessage'
import { GameMode, StateObject } from '../types/GameMode'
import { getGame, getGameEntityFromName, getRole, setRole, getUuid } from './functions'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const initState = (game: ReturnType<typeof GameComponent.get>, gameSchema: GameMode): void => {
  gameSchema.gameObjectRoles.forEach((role) => (game.gameObjects[role] = []))
  gameSchema.gamePlayerRoles.forEach((role) => (game.gamePlayers[role] = []))
}

export const saveInitStateCopy = (entity: Entity): void => {
  const game = getComponent(entity, GameComponent)
  game.initState = JSON.stringify(game.state)
}

export const reInitState = (game: ReturnType<typeof GameComponent.get>): void => {
  game.state = JSON.parse(game.initState)
  applyState(game)
  //console.warn('reInitState', applyStateToClient);
}

export const sendState = (
  game: ReturnType<typeof GameComponent.get>,
  playerComp: ReturnType<typeof GamePlayer.get>
): void => {
  if (!isClient && game.isGlobal) {
    const message: GameStateUpdateMessage = { game: game.name, ownerId: playerComp.uuid, state: game.state }
    //  console.warn('sendState', message);
    console.log(game.state)
    Network.instance.worldState.gameState.push(message)
  }
}

export const sendSpawnGameObjects = (game: ReturnType<typeof GameComponent.get>, uuid): void => {
  if (!isClient && game.isGlobal) {
    Object.keys(Network.instance.networkObjects).forEach((networkId) => {
      // in this if we filter and send only spawnded objects
      if (
        hasComponent(Network.instance.networkObjects[networkId].entity, SpawnedObject) &&
        getComponent(Network.instance.networkObjects[networkId].entity, GameObject).uuid === uuid
      ) {
        Network.instance.worldState.createObjects.push({
          prefabType: Network.instance.networkObjects[networkId].prefabType,
          networkId: Number(networkId),
          ownerId: Network.instance.networkObjects[networkId].ownerId,
          uniqueId: Network.instance.networkObjects[networkId].uniqueId,
          parameters: Network.instance.networkObjects[networkId].parameters // prefabParameters if from project scene, this is ''
        })
      }
    })
  }
}

export const requireState = (
  game: ReturnType<typeof GameComponent.get>,
  playerComp: ReturnType<typeof GamePlayer.get>
): void => {
  if (isClient && game.isGlobal && playerComp.uuid === Network.instance.userId) {
    const message: ClientGameActionMessage = {
      type: ClientActionToServer[0],
      game: game.name,
      velocity: { x: 0, y: 0, z: 0 },
      ownerId: playerComp.uuid,
      uuid: ''
    }
    Network.instance.clientGameAction.push(message)
  }
}

export const requireSpawnObjects = (game: ReturnType<typeof GameComponent.get>, uuid): void => {
  if (isClient && game.isGlobal) {
    const message: ClientGameActionMessage = {
      type: ClientActionToServer[1],
      game: game.name,
      velocity: { x: 0, y: 0, z: 0 },
      ownerId: '',
      uuid: uuid
    }
    Network.instance.clientGameAction.push(message)
  }
}

export const sendVelocity = (entity): void => {
  if (isClient) {
    const gameName = getComponent(entity, GameObject).gameName
    const velocity = getComponent(entity, GolfClubComponent).velocity
    const message: ClientGameActionMessage = {
      type: ClientActionToServer[2],
      game: gameName,
      velocity: { x: velocity.x, y: velocity.y, z: velocity.z },
      ownerId: '',
      uuid: getUuid(entity)
    }
    Network.instance.clientGameAction.push(message)
  }
}

export const applyVelocity = (playerComponent, velocity): void => {
  const clubEntity = playerComponent.ownedObjects['GolfClub']
  getComponent(clubEntity, GolfClubComponent).velocityServer.set(velocity.x, velocity.y, velocity.z)
}

export const applyStateToClient = (stateMessage: GameStateUpdateMessage): void => {
  const entity = getGameEntityFromName(stateMessage.game)
  const game = getComponent(entity, GameComponent)
  game.state = stateMessage.state
  console.warn('applyStateToClient', game.state)
  console.warn('Game Objects Entity', game.gameObjects)
  applyState(game)
}

export const applyState = (game: ReturnType<typeof GameComponent.get>): void => {
  const gameSchema = Engine.gameModes.get(game.gameMode)
  // clean all states
  Object.keys(game.gamePlayers)
    .concat(Object.keys(game.gameObjects))
    .forEach((role: string) => {
      ;(game.gameObjects[role] || game.gamePlayers[role]).forEach((entity: Entity) => {
        const uuid = getUuid(entity)
        /*
      gameSchema.registerActionTagComponents.forEach(component => {
        hasComponent(entity, component ) ? removeComponent(entity, component):'';
      });
*/
        gameSchema.registerStateTagComponents.forEach((component) => {
          hasComponent(entity, component) ? removeComponent(entity, component) : ''
        })
        // add all states
        //  console.warn('// add all states');
        //  console.warn(uuid);
      })
    })

  // Search if server state have spawned objects but client just joined and don't;
  game.state.forEach((v: StateObject) => {
    const localUuids = Object.keys(game.gamePlayers)
      .concat(Object.keys(game.gameObjects))
      .reduce((acc, role: string) => {
        return acc.concat((game.gameObjects[role] || game.gamePlayers[role]).map((entity: Entity) => getUuid(entity)))
      }, [])

    if (localUuids.every((uuid) => uuid != v.uuid)) {
      // spawn
      if (v.components.some((s) => s === 'SpawnedObject')) {
        console.log('require to spawn object', v)
        requireSpawnObjects(game, v.uuid)
      } else {
        console.warn('////////////////////////////////////////////////////////////////')
        console.warn('  WE HAVE A PROBLEM')
        console.warn('////////////////////////////////////////////////////////////////')
      }
    }
  })

  // Adding StateComponent from state to entity
  Object.keys(game.gamePlayers)
    .concat(Object.keys(game.gameObjects))
    .forEach((role: string) => {
      ;(game.gameObjects[role] || game.gamePlayers[role]).forEach((entity: Entity) => {
        const uuid = getUuid(entity)

        const stateObject = game.state.find((v: StateObject) => v.uuid === uuid)

        if (stateObject != undefined) {
          stateObject.components.forEach((componentName: string) => {
            console.log('addState from Network', entity, componentName)
            if (State[componentName]) {
              addComponent(entity, State[componentName], {})
            } else if (GolfState[componentName]) {
              addComponent(entity, GolfState[componentName], {})
            } else console.warn("Couldn't find component", componentName)
          })
          // get ball server position
          if (
            role === 'GolfBall' &&
            Network.instance.networkObjects[Network.instance.localAvatarNetworkId].ownerId ===
              getComponent(entity, NetworkObjectComponent).ownerId
          ) {
            addComponent(entity, GolfState.CorrectBallPosition, {})
          }
        } else {
          // console.log('Local object dont have state, v.uuid != uuid')
          // console.log(role, uuid)
        }
      })
    })
  // console.warn('applyState', game.state)
}

export const correctState = (): void => {
  //TODO:
}

export const removeEntityFromState = (objectOrPlayerComponent, game): void => {
  const index = game.state.findIndex((v) => v.uuid === objectOrPlayerComponent.uuid)
  if (index != -1) {
    game.state.splice(index, 1)
  } else {
    console.warn('cant remove from state, dont have it already', objectOrPlayerComponent.uuid)
  }
}

// export const clearRemovedEntitysFromGame = (game): void => {
//   Object.keys(game.gamePlayers).forEach((role) => {
//     game.gamePlayers[role] = game.gamePlayers[role].filter((entity) => entity.queries.length != 0)
//   })
//   Object.keys(game.gameObjects).forEach((role) => {
//     game.gameObjects[role] = game.gameObjects[role].filter((entity) => entity.queries.length != 0)
//   })
// }

export const addStateComponent = (entity: Entity, component: ComponentConstructor<any, any>): void => {
  if (entity === undefined || hasComponent(entity, component))
    return console.warn('tried to add state that already exists', entity, component.name)

  const uuid = getUuid(entity)
  const role = getRole(entity)
  const game = getGame(entity)

  if (uuid === undefined || role === undefined || game === undefined) {
    console.warn('addStateComponent cant add State, looks like Object or Player leave game')
    return
  }

  addComponent(entity, component, {})
  // console.log('addStateComponent', entity, component.name)

  let objectState = game.state.find((v) => v.uuid === uuid)

  if (objectState === undefined) {
    objectState = { uuid: uuid, role: role, components: [], storage: [] }
    game.state.push(objectState)
  }

  const index = objectState.components.findIndex((name) => name === component.name)
  if (index === -1) {
    objectState.components.push(component.name)
  } else {
    console.warn('we have this gameState already, why?', component.name)
  }
}

export const removeStateComponent = (entity: Entity, component: ComponentConstructor<any, any>): void => {
  if (entity === undefined || !hasComponent(entity, component))
    return console.warn('tried to remove state that doesnt exists', entity, component.name)
  const uuid = getUuid(entity)
  const game = getGame(entity)

  removeComponent(entity, component)
  // console.log('removeStateComponent', entity, component.name)

  const objectState = game.state.find((v) => v.uuid === uuid)
  const index = objectState.components.findIndex((name) => name === component.name)
  if (index === -1) {
    console.warn('dont exist in gameState already, why?', component.name)
  } else {
    objectState.components.splice(index, 1)
  }
}

export const changeRole = (entity: Entity, newGameRole: string): void => {
  const uuid = getUuid(entity)
  const game = getGame(entity)

  let objectState = game.state.find((v) => v.uuid === uuid)

  if (objectState === undefined) {
    objectState = { uuid: uuid, role: '', components: [], storage: [] }
    game.state.push(objectState)
  }

  console.log('change role', newGameRole)

  objectState.role = newGameRole
  objectState.components = []
  objectState.storage = []

  setRole(entity, newGameRole)

  Object.keys(game.gamePlayers).forEach((role) => {
    const index = game.gamePlayers[role].findIndex((entityF) => uuid === getUuid(entityF))
    if (index != -1) {
      game.gamePlayers[role].splice(index, 1)
    }
  })

  game.gamePlayers[newGameRole].push(entity)
}
