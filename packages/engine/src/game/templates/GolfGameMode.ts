import { GameMode } from "../../game/types/GameMode";
// others componennt
import { TransformComponent } from '../../transform/components/TransformComponent';
// game State Tag Component
import { SpawnedObject } from './gameDefault/components/SpawnedObjectTagComponent';
import { Open } from "./gameDefault/components/OpenTagComponent";
import { Closed } from "./gameDefault/components/ClosedTagComponent";
import { ButtonUp } from "./gameDefault/components/ButtonUpTagComponent";
import { ButtonDown } from "./gameDefault/components/ButtonDownTagComponent";
import { PanelDown } from "./gameDefault/components/PanelDownTagComponent";
import { PanelUp } from "./gameDefault/components/PanelUpTagComponent";
import { YourTurn } from "./Golf/components/YourTurnTagComponent";
import { Active } from "./gameDefault/components/ActiveTagComponent";
import { Deactive } from "./gameDefault/components/DeactiveTagComponent";
import { Goal } from "./Golf/components/GoalTagComponent";
// game Action Tag Component
import { HaveBeenInteracted } from "../../game/actions/HaveBeenInteracted";
import { HasHadCollision } from "../../game/actions/HasHadCollision";
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
import { spawnClub } from "./Golf/behaviors/spawnClub";
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
import { GolfPrefabs } from "./Golf/GolfGameConstants";
import { ColliderComponent } from "../../physics/components/ColliderComponent";
import { BodyType } from "three-physx";
import { Euler, Quaternion, Vector3 } from "three";




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
      watchers:[ [ HaveBeenInteracted, remove ] ], // components in one array means HaveBeenInteracted && Close, in different means HaveBeenInteracted || Close
      args: { on: 'me', remove: remove, add: add },
    },{
      behavior: switchState,
      watchers:[ [ HaveBeenInteracted, add ] ],
      args: { on: 'me', remove: add, add: remove },
    }]
  },
}

function somePrepareFunction(gameRules: GameMode) {
  gameRules.initGameState = copleNameRolesInOneString(gameRules.initGameState);

  return gameRules
}

function cloneSameRoleRules(role, changes) {

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



export const GolfGameMode: GameMode = somePrepareFunction({
  name: "Golf",
  priority: 1,
  onGameLoading: onGolfGameLoading,
  onGameStart: onGolfGameStart,
  registerActionTagComponents: [
    HaveBeenInteracted,
    HasHadCollision
  ],
  registerStateTagComponents: [
    Open,
    Closed,
    PanelUp,
    PanelDown,
    YourTurn,
    Active,
    Deactive,
    Goal,
    SpawnedObject
  ],
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
      components: [SpawnedObject]
    },
    'GolfClub': {
      components: [SpawnedObject]
    },
    'GolfHole': {
      behaviors: [addHole, disableInteractive]
    },
    'GolfTee': {
      behaviors: [disableInteractive]
    },
    'StartGamePanel GoalPanel 1stTurnPanel 2stTurnPanel': {
      components: [PanelDown],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ],
      behaviors: [disableInteractive]
    },
    'WaitingPanel': {
      components: [PanelUp],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ]
    },
    'selfOpeningDoor': {
      components: [Closed],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ]
    }
  },
  gamePlayerRoles: {
    'newPlayer': {},
    '1-Player': {
      'hitBall': [
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
        {
          behavior: switchState,
          args: { on: 'target' },
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              '1stTurnPanel': {
                watchers:[ [ PanelDown ] ],
                args: { remove: PanelDown, add: PanelUp }
              },
              '2stTurnPanel': {
                watchers:[ [ PanelUp ] ],
                args: { remove: PanelUp, add: PanelDown }
              }
            }
          }
        },
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
        {
          behavior: nextTurn,
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
        {
          behavior: nextTurn,
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ HasHadCollision ] ],
                checkers:[{
                  function: ifNamed,
                  args: { on: 'target', name: '1' }
                },{
                    function: customChecker,
                    args: {
                      on: 'GolfClub',
                      watchers: [ [ HasHadCollision ] ],
                      checkers:[{
                        function: ifNamed,
                        args: { on: 'me', name: '1' }
                      }]
                     }
                  }]
              }
            }
          }
        }
      ]
    },
    '2-Player': {
      'hitBall': [
        {
          behavior: addForce,
          args: { on: 'target', upForce: 250, forwardForce: 100 },
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ HaveBeenInteracted ] ],
                checkers:[{
                  function: ifNamed,
                  args: { on: 'target', name: '2' }
                }]
              }
            }
          }
        },
        {
          behavior: switchState,
          args: { on: 'target' },
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              '1stTurnPanel': {
                watchers:[ [ PanelUp ] ],
                args: { remove: PanelUp, add: PanelDown }
              },
              '2stTurnPanel': {
                watchers:[ [ PanelDown ] ],
                args: { remove: PanelDown, add: PanelUp }
              },
            }
          }
        },
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
                  args: { on: 'target', name: '2' }
                }]
              }
            }
          }
        },
        {
          behavior: nextTurn,
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ HaveBeenInteracted ] ],
                checkers:[{
                  function: ifNamed,
                  args: { on: 'target', name: '2' }
                }]
              }
            }
          }
        },
        {
          behavior: nextTurn,
          watchers:[ [ YourTurn ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfBall': {
                watchers:[ [ HasHadCollision ] ],
                checkers:[{
                  function: ifNamed,
                  args: { on: 'target', name: '2' }
                },{
                    function: customChecker,
                    args: {
                      on: 'GolfClub',
                      watchers: [ [ HasHadCollision ] ],
                      checkers:[{
                        function: ifNamed,
                        args: { on: 'me', name: '2' }
                      }]
                     }
                  }]
              }
            }
          }
        }
      ]
    }
  },
  gameObjectRoles: {
    'GolfBall': {
      'teleport': [
        {
          behavior: teleportObject,
          watchers:[ [ HasHadCollision ] ],
          takeEffectOn: {
            targetsRole: {
              'GolfTee': {
                checkers:[{
                    function: customChecker,
                    args: {
                      on: 'GolfHole',
                      watchers: [ [ HasHadCollision ] ]
                     }
                  }]
              }
            }
          }
        },
      ]
    },
    'GolfTee': {},
    'GolfHole': {
      'goal': [
        {
          behavior: switchState,
          args: { on: 'target'},
          watchers:[ [ HasHadCollision ] ],
          takeEffectOn: {
            targetsRole: {
              'GoalPanel': {
                watchers:[ [ PanelDown ] ],
                args: { remove: PanelDown, add: PanelUp }
              }
            }
          }
        },
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
      ]
    },
    'GolfClub': {
      'grab': [
        {
          behavior: grabEquippable,
          args: (entityGolfclub) =>  {
            return { ...getComponent(entityGolfclub, HaveBeenInteracted).args }
          },
          watchers:[ [ HaveBeenInteracted ] ],
          takeEffectOn: (entityGolfclub) =>  {
            if(!getComponent(entityGolfclub, HaveBeenInteracted).entityNetworkId) return;
            return Network.instance.networkObjects[getComponent(entityGolfclub, HaveBeenInteracted).entityNetworkId].component.entity },
        },
      ]
    },
    'GoalPanel': {
      'objectMove': templates.switchStateTAndObjectMove( { y:1, stateToMoveBack: PanelDown, stateToMove: PanelUp,  min: 0.2, max: 3 })
    },
    '1stTurnPanel': {
      'objectMove' : templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 4, stateToMoveBack: PanelDown, stateToMove: PanelUp })
    },
    '2stTurnPanel': {
      'objectMove' : templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 4, stateToMoveBack: PanelDown, stateToMove: PanelUp })
    },
    'StartGamePanel': {
      'switchState': templates.isPlayerInGameAndSwitchState({ remove: PanelUp, add: PanelDown }),
      'objectMove': templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 5, stateToMoveBack: PanelDown, stateToMove: PanelUp })
    },
    'WaitingPanel': {
      'switchState': templates.isPlayerInGameAndSwitchState({ remove: PanelDown, add: PanelUp }),
      'objectMove': templates.switchStateTAndObjectMove({ y:1, min: 0.2, max: 5, stateToMoveBack: PanelDown, stateToMove: PanelUp })
    },
    'Door': {
      'switchState': templates.haveBeenInteractedAndSwitchState({ remove: Closed, add: Open }),
      'objectMove': templates.switchStateTAndObjectMove({ z:1, min: 0.2, max: 3, stateToMoveBack: Closed, stateToMove: Open })
    }
  }
});
