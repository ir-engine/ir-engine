import { GameMode } from "../../game/types/GameMode";

import { TransformComponent } from '../../transform/components/TransformComponent';

import { Open } from "./gameDefault/components/OpenTagComponent";
import { Closed } from "./gameDefault/components/ClosedTagComponent";
import { ButtonUp } from "./gameDefault/components/ButtonUpTagComponent";
import { ButtonDown } from "./gameDefault/components/ButtonDownTagComponent";

import { HaveBeenInteracted } from "../../game/actions/HaveBeenInteracted";

import { ifNamed } from "./gameDefault/checkers/ifNamed";
import { upDownButton } from "./gameDefault/behaviors/upDownButton";
import { openOrCloseDoor } from "./gameDefault/behaviors/openOrCloseDoor";


/**
 * @author HydraFire
 */

export const DefaultGameMode: GameMode = {
  name: "Default",
  priority: 0,
  registerActionTagComponents: [
    HaveBeenInteracted
  ],
  registerStateTagComponents: [
    Open,
    Closed,
    ButtonUp,
    ButtonDown
  ],
  initGameState: {
    'Button': {
      components: [ButtonUp],
      storage:[
        { component: TransformComponent, variables: ['position'] }
       ]
     },
    'Door': {
      components: [Closed],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ]
    }
  },
  gamePlayerRoles: {
    'Playing': {
      'getVictory': []
    },
    'itsYourTurn': {
      'allowHitBall': []
    }
  },
  gameObjectRoles: {
    'Button': {
      'Action-OpenOrCloseDoor': [
        {
          behavior: openOrCloseDoor,
          args:{ action: 'open', animationSpeed: 10 },
          watchers:[ [ HaveBeenInteracted ] ],
          takeEffectOn: {
        //    sortMetod: (v) => { return [v[(Math.random() * v.length) | 0]]}, // if undefind will bee effect on all
            targetsRole: {
              'Door': {
                watchers:[ [ Closed ] ],
                checkers:[{
                  function: ifNamed,
                  args: { value: 'wooden door' }
                }]
              }
            }
          }
        },
        {
          behavior: openOrCloseDoor,
          args:{ action: 'close', animationSpeed: 10 },
          watchers:[ [ HaveBeenInteracted ] ],
          takeEffectOn: {
        //    sortMetod: (v) => { return [v[(Math.random() * v.length) | 0]]}, // if undefind will bee effect on all
            targetsRole: {
              'Door': {
                watchers:[ [ Open ] ],
                checkers:[{
                  function: ifNamed,
                  args: { value: 'wooden door' }
                }],
                args: { animationSpeed: 5 }
              }
            }
          }
        }
      ],
      'Action-UpDownButton': [
        {
          behavior: upDownButton,
          args:{ action: 'down', animationSpeed: 3 },
          watchers:[ [ HaveBeenInteracted, ButtonUp ] ]
        },
        {
          behavior: upDownButton,
          args:{ action: 'up', animationSpeed: 3 },
          watchers:[ [ HaveBeenInteracted, ButtonDown ] ]
        }
      ]
    },
    'Door': {
      'rotateCollider': []
    }
  }
};
/*
export const gameStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
actions: {
  [DefaultGameStateAction.onGameStarted]: gameStartAction,
  [DefaultGameStateAction.onGameEnded]: gameEndAction,
  [DefaultGameStateAction.onRoundStarted]: roundStartAction,
  [DefaultGameStateAction.onRoundEnded]: roundEndAction,
  [DefaultGameStateAction.onPlayerTurnStarted]: playerTurnStartAction,
  [DefaultGameStateAction.onPlayerTurnEnded]: playerTurnEndAction,
  [DefaultGameStateAction.onPlayerAttempted]: playerAttemptAction,
  [DefaultGameStateAction.onPlayerScored]: playerScoreAction
},
serverActions: {
  [DefaultGameStateAction.onGameStarted]: gameStartActionServer,
  [DefaultGameStateAction.onGameEnded]: gameEndActionServer,
  [DefaultGameStateAction.onRoundStarted]: roundStartActionServer,
  [DefaultGameStateAction.onRoundEnded]: roundEndActionServer,
  [DefaultGameStateAction.onPlayerTurnStarted]: playerTurnStartActionServer,
  [DefaultGameStateAction.onPlayerTurnEnded]: playerTurnEndActionServer,
  [DefaultGameStateAction.onPlayerAttempted]: playerAttemptAction,
  [DefaultGameStateAction.onPlayerScored]: playerScoreAction
},
//allowedPlayerActions: [],
/*
allowedHostActions: [
  DefaultGameStateAction.onGameStarted,
  DefaultGameStateAction.onGameEnded
],
*/
