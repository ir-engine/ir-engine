import { GameMode } from '../../game/types/GameMode'
import { Action, State } from '../types/GameComponents'
import { nextTurn } from './Golf/behaviors/nextTurn'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { Entity } from '../../ecs/classes/Entity'
import { GolfPrefabs } from './Golf/prefab/GolfGamePrefabs'
import { removeSpawnedObjects } from '../functions/functions'
/**
 * @author HydraFire
 */

function preparePlayerRoles(gameRules: GameMode, maxPlayerCount = 1) {
  for (let playerNumber = 1; playerNumber <= maxPlayerCount; playerNumber++) {
    gameRules.gamePlayerRoles.push(playerNumber + '-Player')
  }
}

const onGolfGameStart = (entity: Entity) => {}

const onGolfGameLoading = (entity: Entity) => {}

const beforeGolfPlayerLeave = (entity: Entity) => {
  console.log('beforeGolfPlayerLeave')
  if (getComponent(entity, State.YourTurn, true) || getComponent(entity, State.Waiting, true)) {
    nextTurn(entity)
  }
}

const onGolfPlayerLeave = (entity: Entity, playerComponent, game) => {
  console.log('onGolfPlayerLeave')
  //  const entityArray = getEntityOwnedObjects(entity)
  //  entityArray.forEach(entityObjects => removeSpawnedObject(entityObjects));
  removeSpawnedObjects(entity, playerComponent, game)
  //console.warn('need clean score');
}

const createTeeRoles = (count: number) => {
  const arr = []
  for (let i = 0; i < count; i++) {
    arr.push(`GolfTee-${i}`)
  }
  return arr
}

export const GolfGameMode: GameMode = {
  name: 'Golf',
  priority: 1,
  preparePlayersRole: preparePlayerRoles,
  onGameLoading: onGolfGameLoading,
  onGameStart: onGolfGameStart,
  beforePlayerLeave: beforeGolfPlayerLeave,
  onPlayerLeave: onGolfPlayerLeave, // player can leave game without disconnect
  registerActionTagComponents: [], // now auto adding
  registerStateTagComponents: [],
  gamePlayerRoles: [],
  gameObjectRoles: ['GolfBall', ...createTeeRoles(18), 'GolfHole', 'GolfClub']
}
