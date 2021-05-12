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
import { YourTurn } from "./Golf/components/YourTurnTagComponent";
// game Action Tag Component
import { HaveBeenInteracted } from "../../game/actions/HaveBeenInteracted";
import { NextTurn } from "../../game/actions/NextTurn";
// game behavior
import { upDownButton } from "./gameDefault/behaviors/upDownButton";
import { upDownPanel, giveUpOrDownState } from "./gameDefault/behaviors/upDownPanel";
import { giveOpenOrCloseState, doorOpeningOrClosing } from "./gameDefault/behaviors/openOrCloseDoor";

import { addForce } from "./Golf/behaviors/addForce";
import { addRole } from "./Golf/behaviors/addRole";
import { addTurn } from "./Golf/behaviors/addTurn";
import { applyTurn } from "./Golf/behaviors/applyTurn";
import { nextTurn } from "./Golf/behaviors/nextTurn";
import { addRestitution } from "./Golf/behaviors/addRestitution";
import { unInteractiveToOthers } from "./Golf/behaviors/unInteractiveToOthers";
// checkers
import { isPlayersInGame } from "./gameDefault/checkers/isPlayersInGame";
import { ifNamed } from "./gameDefault/checkers/ifNamed";
import { isOpen, isClosed } from "./gameDefault/checkers/isOpenIsClosed";
import { isUp, isDown } from "./gameDefault/checkers/isUpIsDown";
import { spawnEntity } from "./gameDefault/behaviors/spawnEntity";

/**
 * @author HydraFire
 */

export const GolfGameMode: GameMode = {
  name: "Golf",
  priority: 1,
  registerActionTagComponents: [
    HaveBeenInteracted,
    NextTurn
  ],
  registerStateTagComponents: [
    Open,
    Closed,
    PanelUp,
    PanelDown,
    YourTurn
  ],
  initGameState: {
    'newPlayer': {
      behaviors: [addRole]
    },
    '1-Player': {
      behaviors: [addTurn]
    },
    'GolfBall': {
      behaviors: [addRestitution, unInteractiveToOthers]
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
    'newPlayer': {},
    '1-Player': {
      'MyTurn': [
        { behavior: applyTurn, watchers:[ [ NextTurn ] ] }
      ],
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
        }
      ]
    },
    '2-Player': {
      'MyTurn': [
        { behavior: applyTurn, watchers:[ [ NextTurn ] ] }
      ],
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
        }
      ]
    }
  },
  gameObjectRoles: {
    'GolfBall': {},
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
