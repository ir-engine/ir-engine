import { GameMode } from "../../game/types/GameMode";
// others componennt
import { TransformComponent } from '../../transform/components/TransformComponent';
// game State Tag Component
import { Action, State } from '../types/GameComponents'
// game behavior
import { executeBehaviorArray } from "./gameDefault/behaviors/executeBehaviorArray";
import { objectMove } from "./gameDefault/behaviors/objectMove";
import { switchState } from "./gameDefault/behaviors/switchState";
import { giveState } from "./gameDefault/behaviors/giveState";
//
import { addForce } from "./Golf/behaviors/addForce";
import { teleportObject } from "./Golf/behaviors/teleportObject";
//
import { addRole } from "./Golf/behaviors/addRole";
import { addTurn } from "./Golf/behaviors/addTurn";
import { applyTurn } from "./Golf/behaviors/applyTurn";
import { nextTurn } from "./Golf/behaviors/nextTurn";

//
//
import { initScore, saveScore } from "./Golf/behaviors/saveScore";
import { displayScore } from "./Golf/behaviors/displayScore";
import { giveGoalState } from "./Golf/behaviors/giveGoalState";
//
import { spawnClub, updateClub } from "./Golf/prefab/GolfClubPrefab";
import { addBall } from "./Golf/behaviors/addBall";
import { addHole } from "./Golf/behaviors/addHole";
// checkers
import { isPlayersInGame } from "./gameDefault/checkers/isPlayersInGame";
import { ifNamed } from "./gameDefault/checkers/ifNamed";
import { customChecker } from "./gameDefault/checkers/customChecker";
import { isDifferent } from "./gameDefault/checkers/isDifferent";

import { grabEquippable } from "../../interaction/functions/grabEquippable";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { disableInteractiveToOthers, disableInteractive } from "./Golf/behaviors/disableInteractiveToOthers";
import { spawnBall } from "./Golf/behaviors/spawnBall";
import { Network } from "../../networking/classes/Network";
import { giveBall } from "./Golf/behaviors/giveBall";
import { Entity } from "../../ecs/classes/Entity";
import { GolfPrefabs } from "./Golf/prefab/GolfGamePrefabs";
import { ColliderComponent } from "../../physics/components/ColliderComponent";
import { BodyType } from "three-physx";
import { Euler, Quaternion, Vector3 } from "three";
import { removeSpawnedObjects } from "../functions/functions";




/**
 * @author HydraFire
 */

const templates = {

  switchStateTAndObjectMove: ({x=0, y=0, z=0, stateToMove, stateToMoveBack, min=0.2, max=3 }) => {
    return [{
      behavior: objectMove,
      args:{ vectorAndSpeed: { x: x * -1, y: y * -1, z: z * -1} },
      watchers:[ [ stateToMoveBack ] ],
      checkers:[{
        function: isDifferent, args: { min: min }
      }]
    },{
      behavior: objectMove,
      args:{ vectorAndSpeed: { x: x, y: y, z: z } },
      watchers:[ [ stateToMove ] ],
      checkers:[{
        function: isDifferent, args: { max: max }
      }]
    }];
  },

  isPlayerInGameAndSwitchState: ({ remove, add }) => {
    return [{
      behavior: switchState,
      args: { on: 'me', add: remove, remove: add  },
      checkers:[{ function: isPlayersInGame }]
    },{
      behavior: switchState,
      args: { on: 'me', add: add, remove: remove },
      checkers:[{ function: isPlayersInGame, args:{ invert: true} }]
    }]
  },

  haveBeenInteractedAndSwitchState: ({ remove, add }) => {
    return [{
      behavior: switchState,
      watchers:[ [ Action.HaveBeenInteracted, remove ] ], // components in one array means HaveBeenInteracted && Close, in different means HaveBeenInteracted || Close
      args: { on: 'me', remove: remove, add: add },
    },{
      behavior: switchState,
      watchers:[ [ Action.HaveBeenInteracted, add ] ],
      args: { on: 'me', remove: add, add: remove },
    }]
  },
}

function somePrepareFunction(gameRules: GameMode) {
  gameRules.initGameState = copleNameRolesInOneString(gameRules.initGameState);
  gameRules.registerActionTagComponents = registerAllActions(); //TO DO: registerActionsOnlyUsedInThisMode();
  gameRules.registerStateTagComponents = registerAllStates(); //TO DO: registerStatesOnlyUsedInThisMode();
  gameRules.gamePlayerRoles = cloneSameRoleRules( gameRules.gamePlayerRoles, { from:'1-Player', to: '2-Player'})
  return gameRules
}

function cloneSameRoleRules(object, args) {
  object[args.to] = JSON.parse(JSON.stringify(object[args.from]))
  return object;
}

function registerAllActions() {
  return Object.keys(Action).map(key => Action[key])
}
function registerAllStates() {
  return Object.keys(State).map(key => State[key])
}

function copleNameRolesInOneString( object ) {
  const needsCopyArr = Object.keys(object).filter(str => str.includes(' '));
  if (needsCopyArr.length === 0) return;
  const objectWithCorrectRoles = needsCopyArr.reduce((acc, v) => Object.assign(acc, ...v.split(' ').map(roleName => ({ [roleName]: object[v] }))) ,{})
  needsCopyArr.forEach(key => delete object[key]);
  return Object.assign(object, objectWithCorrectRoles);
}

const onGolfGameStart = (entity: Entity) => {}

const onGolfGameLoading = (entity: Entity) => {
  // add our prefabs - TODO: find a better way of doing this that doesn't pollute prefab namespace
  Object.entries(GolfPrefabs).forEach(([prefabType, prefab]) => {
    Network.instance.schema.prefabs[prefabType] = prefab;
  })
}

const onGolfPlayerLeave = (entity: Entity, playerComponent, game) => {
//  const entityArray = getEntityOwnedObjects(entity)
//  entityArray.forEach(entityObjects => removeSpawnedObject(entityObjects));
  removeSpawnedObjects(entity, playerComponent, game);
  //console.warn('need clean score');
}


export const GolfGameMode: GameMode = somePrepareFunction({
  name: "Golf",
  priority: 1,
  onGameLoading: onGolfGameLoading,
  onGameStart: onGolfGameStart,
  onPlayerLeave: onGolfPlayerLeave, // not disconnected, in future we will allow to Leave game witout disconnect from location
  registerActionTagComponents: [], // now auto adding
  registerStateTagComponents: [], // now auto adding
  initGameState: {
    'newPlayer': {
      behaviors: [addRole, spawnBall, spawnClub]
    },
    '1-Player': {
      behaviors: [addTurn, initScore]
    },
    '2-Player': {
      behaviors: [initScore]
    },
    'GolfBall': {
      components: [State.SpawnedObject, State.Active]
    },
    'GolfClub': {
      components: [State.SpawnedObject]
    },
    'GolfHole': {
      behaviors: [addHole, disableInteractive]
    },
    'GolfTee': {
      behaviors: [disableInteractive]
    },
    'StartGamePanel GoalPanel 1stTurnPanel 2stTurnPanel': {
      components: [State.PanelDown],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ],
      behaviors: [disableInteractive]
    },
    'WaitingPanel': {
      components: [State.PanelUp],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ]
    },
    'selfOpeningDoor': {
      components: [State.Closed],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ]
    }
  },
  gamePlayerRoles: {
    'newPlayer': {},
    '1-Player': {
      'hitBall': [
/*
        {
          behavior: addForce,
          args: { on: 'target', upForce: 250, forwardForce: 100 },
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ HaveBeenInteracted ] ]
              }
            }
          }
        },
*/
        {
          behavior: switchState,
          args: { on: 'target' },
          watchers:[ [ State.YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              '1stTurnPanel': {
                watchers:[ [ State.PanelDown ] ],
                args: { remove: State.PanelDown, add: State.PanelUp }
              },
              '2stTurnPanel': {
                watchers:[ [ State.PanelUp ] ],
                args: { remove: State.PanelUp, add: State.PanelDown }
              }
            }
          }
        },
/*
        {
          behavior: saveScore,
          args: { on: 'me' },
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ HaveBeenInteracted ] ],
                checkers:[{
                  function: ifNamed,
                  args: { on: 'target', name: '1' }
                }]
              }
            }
          }
        },
*/
        { //doBallNotHiting //GameObjectCollisionTag
          behavior: switchState,
          args: { on: 'target', add: State.Deactive, remove: State.Active },
          watchers:[ [ State.YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ State.Active, Action.BallMoving ] ],


                /*
                checkers:[{
                  function: ifOwned,
                  args: { on: 'target', name: '1' }
                }]
                */
              }
            }
          }
        },
        {
          behavior: nextTurn, // GameObjectCollisionTag
          watchers:[ [ State.YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ State.Deactive, Action.BallStopped ] ],
              }
            }
          }
        }
      ]
    }
  },
  gameObjectRoles: {
    'GolfBall': {},
    'GolfTee': {},
    'GolfHole': {
      'goal': [
        {
          behavior: switchState,
          args: { on: 'target'},
          watchers:[ [ Action.GameObjectCollisionTag ] ],
          takeEffectOn: {
            targetsRole: {
              'GoalPanel': {
                watchers:[ [ State.PanelDown ] ],
                args: { remove: State.PanelDown, add: State.PanelUp }
              }
            }
          }
        },
        /* NEED WORK
        {
          behavior: giveState,
          args: { on: 'target', component: Goal },
          watchers:[ [ HasHadCollision ] ],
          takeEffectOn: {
            targetsRole: {
              '1-Player' : {
                checkers:[{
                    function: customChecker,
                    args: {
                      on: 'GolfBall',
                      watchers: [ [ HasHadCollision ] ],
                      checkers:[{
                        function: ifNamed,
                        args: { on: 'me', name: '1' }
                      }]
                     }
                  }]
              },
              '2-Player' : {
                checkers:[{
                    function: customChecker,
                    args: {
                      on: 'GolfBall',
                      watchers: [ [ HasHadCollision ] ],
                      checkers:[{
                        function: ifNamed,
                        args: { on: 'me', name: '2' }
                      }]
                     }
                  }]
              },
            }
          }
        },
        */
       ]
    },
    'GolfClub': {
      'update': [
        {
          behavior: updateClub,
          args: {},
        }
      ],
      'grab': [
        {
          behavior: grabEquippable,
          args: (entityGolfclub) =>  {
            return { ...getComponent(entityGolfclub, Action.HaveBeenInteracted).args }
          },
          watchers:[ [ Action.HaveBeenInteracted ] ],
          takeEffectOn: (entityGolfclub) =>  {
            if(!getComponent(entityGolfclub, Action.HaveBeenInteracted).entityNetworkId) return;
            return Network.instance.networkObjects[getComponent(entityGolfclub, Action.HaveBeenInteracted).entityNetworkId].component.entity },
        },
      ]
    },
    'GoalPanel': {
      'objectMove': templates.switchStateTAndObjectMove( { y:1, stateToMoveBack: State.PanelDown, stateToMove: State.PanelUp,  min: 0.2, max: 3 })
    },
    '1stTurnPanel': {
      'objectMove' : templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 4, stateToMoveBack: State.PanelDown, stateToMove: State.PanelUp })
    },
    '2stTurnPanel': {
      'objectMove' : templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 4, stateToMoveBack: State.PanelDown, stateToMove: State.PanelUp })
    },
    'StartGamePanel': {
      'switchState': templates.isPlayerInGameAndSwitchState({ remove: State.PanelUp, add: State.PanelDown }),
      'objectMove': templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 5, stateToMoveBack: State.PanelDown, stateToMove: State.PanelUp })
    },
    'WaitingPanel': {
      'switchState': templates.isPlayerInGameAndSwitchState({ remove: State.PanelDown, add: State.PanelUp }),
      'objectMove': templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 5, stateToMoveBack: State.PanelDown, stateToMove: State.PanelUp })
    },
    'Door': {
      'switchState': templates.haveBeenInteractedAndSwitchState({ remove: State.Closed, add: State.Open }),
      'objectMove': templates.switchStateTAndObjectMove({ z:1, min: 0.2, max: 3, stateToMoveBack: State.Closed, stateToMove: State.Open })
    }
  }
});
