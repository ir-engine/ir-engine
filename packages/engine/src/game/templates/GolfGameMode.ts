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

function somePrepareFunction(gameRules: GameMode) {
  gameRules.registerActionTagComponents = registerAllActions() //TO DO: registerActionsOnlyUsedInThisMode();
  gameRules.registerStateTagComponents = registerAllStates() //TO DO: registerStatesOnlyUsedInThisMode();
  return gameRules
}

function preparePlayerRoles(gameRules: GameMode, maxPlayerCount = 1) {
  for (let playerNumber = 1; playerNumber <= maxPlayerCount; playerNumber++) {
    gameRules.gamePlayerRoles.push(playerNumber + '-Player')
  }
}

function registerAllActions() {
  return Object.keys(Action).map((key) => Action[key])
}
function registerAllStates() {
  return Object.keys(State).map((key) => State[key])
}

const onGolfGameStart = (entity: Entity) => {}

const onGolfGameLoading = (entity: Entity) => {
  // add our prefabs - TODO: find a better way of doing this that doesn't pollute prefab namespace
  Object.entries(GolfPrefabs).forEach(([prefabType, prefab]) => {
    Network.instance.schema.prefabs.set(Number(prefabType), prefab)
  })
}

const beforeGolfPlayerLeave = (entity: Entity) => {
  if (getComponent(entity, State.YourTurn, true) || getComponent(entity, State.Waiting, true)) {
    nextTurn(entity)
  }
}

const onGolfPlayerLeave = (entity: Entity, playerComponent, game) => {
  //  const entityArray = getEntityOwnedObjects(entity)
  //  entityArray.forEach(entityObjects => removeSpawnedObject(entityObjects));
  removeSpawnedObjects(entity, playerComponent, game)
  //console.warn('need clean score');
}

export const GolfGameMode: GameMode = somePrepareFunction({
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
  gameObjectRoles: [
    'GolfBall',
    'GolfTee-0',
    'GolfTee-1',
    'GolfTee-2',
    'GolfTee-3',
    'GolfTee-4',
    'GolfTee-5',
    'GolfTee-6',
    'GolfTee-7',
    'GolfTee-8',
    'GolfTee-9',
    'GolfTee-10',
    'GolfTee-11',
    'GolfTee-12',
    'GolfTee-13',
    'GolfHole',
    'GolfClub'
  ]
})
