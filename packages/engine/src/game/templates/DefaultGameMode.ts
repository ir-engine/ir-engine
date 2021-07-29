import { GameMode } from '../../game/types/GameMode'
import { TransformComponent } from '../../transform/components/TransformComponent'
// game State Tag Component
import { Open } from './gameDefault/components/OpenTagComponent'
import { Closed } from './gameDefault/components/ClosedTagComponent'
import { ButtonUp } from './gameDefault/components/ButtonUpTagComponent'
import { ButtonDown } from './gameDefault/components/ButtonDownTagComponent'
// game Action Tag Component
// game behavior
//import { upDownButton } from "./gameDefault/behaviors/upDownButton";
//import { giveOpenOrCloseState, doorOpeningOrClosing } from "./gameDefault/behaviors/openOrCloseDoor";
// checkers
import { ifNamed } from './gameDefault/checkers/ifNamed'
//import { isOpen, isClosed } from "./gameDefault/checkers/isOpenIsClosed";

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const DefaultGameMode: GameMode = {
  name: 'Default',
  priority: 0,
  registerActionTagComponents: [],
  registerStateTagComponents: [Open, Closed, ButtonUp, ButtonDown],
  gamePlayerRoles: [],
  gameObjectRoles: []
  /*
    'Button': {
      'Action-OpenOrCloseDoor': [
        {
          behavior: giveOpenOrCloseState,
          args: { on: 'target'},
          watchers:[ [ HasHadInteraction ] ],
          checkers:[{
            function: ifNamed,
            args: { on: 'me', name: 'button 1' }
          }],
          takeEffectOn: {
        //    sortMethod: (v) => { return [v[(Math.random() * v.length) | 0]]}, // if undefind will bee effect on all
            targetsRole: {
              'Door': {
                watchers:[ [ Open ], [ Closed ] ],
                checkers:[{
                  function: ifNamed,
                  args: { on: 'target', name: 'door 1' }
                }]
              }
            }
          }
        },
        {
          behavior: giveOpenOrCloseState,
          args: { on: 'target'},
          watchers:[ [ HasHadInteraction ] ],
          checkers:[{
            function: ifNamed,
            args: { on: 'me', name: 'button 2' }
          }],
          takeEffectOn: {
        //    sortMethod: (v) => { return [v[(Math.random() * v.length) | 0]]}, // if undefind will bee effect on all
            targetsRole: {
              'Door': {
                watchers:[ [ Open ], [ Closed ] ],
                checkers:[{
                  function: ifNamed,
                  args: { on: 'target', name: 'door 2' }
                }]
              }
            }
          }
        }
      ],
      'Action-UpDownButton': [
        {
          behavior: upDownButton,
          args:{ action: 'down', animationSpeed: 3 },
          watchers:[ [ HasHadInteraction, ButtonUp ] ],
          checkers:[{
            function: ifNamed,
            args: { on: 'me', name: 'button 1' }
          }]
        },
        {
          behavior: upDownButton,
          args:{ action: 'up', animationSpeed: 3 },
          watchers:[ [ HasHadInteraction, ButtonDown ] ],
          checkers:[{
            function: ifNamed,
            args: { on: 'me', name: 'button 1' }
          }]
        },
        {
          behavior: upDownButton,
          args:{ action: 'down', animationSpeed: 3 },
          watchers:[ [ HasHadInteraction, ButtonUp ] ],
          checkers:[{
            function: ifNamed,
            args: { on: 'me', name: 'button 2' }
          }]
        },
        {
          behavior: upDownButton,
          args:{ action: 'up', animationSpeed: 3 },
          watchers:[ [ HasHadInteraction, ButtonDown ] ],
          checkers:[{
            function: ifNamed,
            args: { on: 'me', name: 'button 2' }
          }]
        }
      ]
    },
    'Door': {
      'moveDoor': [
        {
          behavior: doorOpeningOrClosing,
          args:{ action: 'opening', animationSpeed: 0.5 },
          watchers:[ [ Closed ] ],
          checkers:[{
            function: isOpen,
            args: { diff: 0.02 }
          }]
        },
        {
          behavior: doorOpeningOrClosing,
          args:{ action: 'closing', animationSpeed: 0.5 },
          watchers:[ [ Open ] ],
          checkers:[{
            function: isClosed,
            args: { diff: 2 }
          }]
        }
      ]
    },
    'selfOpeningDoor': {
      'actionOpen': [
        {
          behavior: giveOpenOrCloseState,
          args: { on: 'me'},
          watchers:[ [ HasHadInteraction ] ]
        }
      ],
      'moveDoor': [
        {
          behavior: doorOpeningOrClosing,
          args:{ action: 'opening', animationSpeed: 2 },
          watchers:[ [ Closed ] ],
          checkers:[{
            function: isOpen,
            args: { diff: 0.02 }
          }]
        },
        {
          behavior: doorOpeningOrClosing,
          args:{ action: 'closing', animationSpeed: 2 },
          watchers:[ [ Open ] ],
          checkers:[{
            function: isClosed,
            args: { diff: 2 }
          }]
        }
      ]
    }
    */
  // }
}
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
