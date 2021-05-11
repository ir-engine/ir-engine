import { GameMode } from "../../game/types/GameMode";
// others componennt
import { TransformComponent } from '../../transform/components/TransformComponent';
// game State Tag Component
import { Open } from "./gameDefault/components/OpenTagComponent";
import { Closed } from "./gameDefault/components/ClosedTagComponent";
import { ButtonUp } from "./gameDefault/components/ButtonUpTagComponent";
import { ButtonDown } from "./gameDefault/components/ButtonDownTagComponent";
import { PanelDown } from "./gameDefault/components/PanelDownTagComponent";
import { PanelUp } from "./gameDefault/components/PanelUpTagComponent";
import { YourTurn } from "./gameDefault/components/YourTurnTagComponent";
// game Action Tag Component
import { HaveBeenInteracted } from "../../game/actions/HaveBeenInteracted";
// game behavior
import { upDownButton } from "./gameDefault/behaviors/upDownButton";
import { upDownPanel, giveUpOrDownState } from "./gameDefault/behaviors/upDownPanel";
import { giveOpenOrCloseState, doorOpeningOrClosing } from "./gameDefault/behaviors/openOrCloseDoor";
import { addForce } from "./gameDefault/behaviors/addForce";
// checkers
import { isPlayersInGame } from "./gameDefault/checkers/isPlayersInGame";
import { ifNamed } from "./gameDefault/checkers/ifNamed";
import { isOpen, isClosed } from "./gameDefault/checkers/isOpenIsClosed";
import { isUp, isDown } from "./gameDefault/checkers/isUpIsDown";

/**
 * @author HydraFire
 */

export const GolfGameMode: GameMode = {
  name: "Golf",
  priority: 1,
  registerActionTagComponents: [
    HaveBeenInteracted
  ],
  registerStateTagComponents: [
    Open,
    Closed,
    PanelUp,
    PanelDown
  ],
  initGameState: {
    'Playing': {
      components: [YourTurn]
    },
    'StartGamePanel': {
      components: [PanelDown],
      storage:[
        { component: TransformComponent, variables: ['position'] }
      ]
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
    'Playing': {
      'getVictory': []
    }
  },
  gameObjectRoles: {
    'GolfBall': {
      'hit':[
        {
          behavior: addForce,
          args: { on: 'me', force: 300 },
          watchers:[ [ HaveBeenInteracted ] ],
          takeEffectOn: {
            targetsRole: {
              'Playing': {
                watchers:[ [ YourTurn ] ]
              }
            }
          }
        },
      ]
    },
    'StartGamePanel': {
      'actionUp': [
        {
          behavior: giveUpOrDownState,
          args: { on: 'me', give: 'up' },
          checkers:[{
            function: isPlayersInGame,
            args: { invert: false }
          }]
        },
        {
          behavior: giveUpOrDownState,
          args: { on: 'me', give: 'down' },
          checkers:[{
            function: isPlayersInGame,
            args: { invert: true }
          }]
        }
      ],
      'movePanel': [
        {
          behavior: upDownPanel,
          args:{ action: 'down', animationSpeed: 2 },
          watchers:[ [ PanelDown ] ],
          checkers:[{
            function: isUp,
            args: { diff: 0.2 }
          }]
        },{
          behavior: upDownPanel,
          args:{ action: 'up', animationSpeed: 2 },
          watchers:[ [ PanelUp ] ],
          checkers:[{
            function: isDown,
            args: { diff: 5 }
          }]
        }
      ]
    },
    'WaitingPanel': {
      'actionUp': [
        {
          behavior: giveUpOrDownState,
          args: { on: 'me', give: 'up' },
          checkers:[{
            function: isPlayersInGame,
            args: { invert: true }
          }]
        },
        {
          behavior: giveUpOrDownState,
          args: { on: 'me', give: 'down' },
          checkers:[{
            function: isPlayersInGame,
            args: { invert: false }
          }]
        }
      ],
      'movePanel': [
        {
          behavior: upDownPanel,
          args:{ action: 'down', animationSpeed: 2 },
          watchers:[ [ PanelDown ] ],
          checkers:[{
            function: isUp,
            args: { diff: 0.02 }
          }]
        },{
          behavior: upDownPanel,
          args:{ action: 'up', animationSpeed: 2 },
          watchers:[ [ PanelUp ] ],
          checkers:[{
            function: isDown,
            args: { diff: 5 }
          }]
        }
      ]
    },
    'selfOpeningDoor': {
      'actionOpen': [
        {
          behavior: giveOpenOrCloseState,
          args: { on: 'me'},
          watchers:[ [ HaveBeenInteracted ] ]
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
  }
};
