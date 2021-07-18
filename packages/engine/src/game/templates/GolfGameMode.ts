import { GameMode } from '../../game/types/GameMode'
// others componennt
import { TransformComponent } from '../../transform/components/TransformComponent'
// game State Tag Component
import { Action, State } from '../types/GameComponents'
// game behavior
import { executeBehaviorArray } from './gameDefault/behaviors/executeBehaviorArray'
import { objectMove } from './gameDefault/behaviors/objectMove'
import { addState, removeState, switchState } from './gameDefault/behaviors/switchState'
import { setHideModel } from './gameDefault/behaviors/setHideModel'
//
import { addForce } from './Golf/behaviors/addForce'
import { removeVelocity, teleportObject } from './Golf/behaviors/teleportObject'
//
import { addRole } from './Golf/behaviors/addRole'
import { addTurn } from './Golf/behaviors/addTurn'
import { applyTurn } from './Golf/behaviors/applyTurn'
import { nextTurn } from './Golf/behaviors/nextTurn'

//
//
import { initScore, saveScore } from './Golf/behaviors/saveScore'
import { displayScore, saveGoalScore } from './Golf/behaviors/displayScore'
import { giveGoalState } from './Golf/behaviors/giveGoalState'
//
import { spawnClub, updateClub } from './Golf/prefab/GolfClubPrefab'
import { addBall } from './Golf/behaviors/addBall'
import { addHole } from './Golf/behaviors/addHole'
// checkers
import { isPlayersInGame } from './gameDefault/checkers/isPlayersInGame'
import { ifGetOut } from './gameDefault/checkers/ifGetOut'
import { ifOwned } from './gameDefault/checkers/ifOwned'
import { dontHasState } from './gameDefault/checkers/dontHasState'
import { customChecker } from './gameDefault/checkers/customChecker'
import { isDifferent } from './gameDefault/checkers/isDifferent'
import { doesPlayerHaveGameObject } from './gameDefault/checkers/doesPlayerHaveGameObject'

// others
import { grabEquippable } from '../../interaction/functions/grabEquippable'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { disableInteractiveToOthers, disableInteractive } from './Golf/behaviors/disableInteractiveToOthers'
import { Network } from '../../networking/classes/Network'
import { Entity } from '../../ecs/classes/Entity'
import { GolfPrefabs } from './Golf/prefab/GolfGamePrefabs'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { BodyType } from 'three-physx'
import { Euler, Quaternion, Vector3 } from 'three'
import { removeSpawnedObjects } from '../functions/functions'
import { ifVelocity } from './gameDefault/checkers/ifVelocity'
import { spawnBall, updateBall } from './Golf/prefab/GolfBallPrefab'
import { hitBall } from './Golf/behaviors/hitBall'
import { teleportPlayerBehavior } from './Golf/behaviors/teleportPlayer'
import { getPositionNextPoint } from './Golf/behaviors/getPositionNextPoint'

// ui
import { createYourTurnPanel } from './Golf/behaviors/createYourTurnPanel'
import { setupPlayerInput } from './Golf/behaviors/setupPlayerInput'
import { makeKinematic } from './Golf/behaviors/makeKinematic'
import { hasState } from './gameDefault/checkers/hasState'
import { GolfClubComponent } from './Golf/components/GolfClubComponent'
import { setupOfflineDebug } from './Golf/behaviors/setupOfflineDebug'
import { setupPlayerAvatar } from './Golf/behaviors/setupPlayerAvatar'

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
    Network.instance.schema.prefabs[prefabType] = prefab
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
