import { GameMode } from "../../game/types/GameMode";
import { GameStateAction } from "../../game/types/GameStateAction";
import { DefaultGameStateAction } from "./DefaultGameStateAction";
import { Open } from "./gameDefault/components/OpenTagComponent";
import { Closed } from "./gameDefault/components/ClosedTagComponent";
import { ButtonUp } from "./gameDefault/components/ButtonUpTagComponent";
import { ButtonDown } from "./gameDefault/components/ButtonDownTagComponent";
import { HaveBeenInteracted } from "../../interaction/components/HaveBeenInteractedTagComponent";
import { ifNamed } from "./gameDefault/checkers/ifNamed";
import { upDownButton } from "./gameDefault/behaviors/upDownButton";
import { openOrCloseDoor } from "./gameDefault/behaviors/openOrCloseDoor";

/**
 * @author HydraFire
 */

export const gameStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const gameStartActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const roundStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const roundEndAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const playerTurnStartAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const playerTurnEndAction: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const roundStartActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const roundEndActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const playerTurnStartActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}
export const playerTurnEndActionServer: GameStateAction = (data: any): void => {
  console.log("Game started!");
  console.log("data is", data);
}

export const gameEndAction: GameStateAction = (data: any): void => {
  console.log("Game over!");
  console.log("data is", data);
}
export const gameEndActionServer: GameStateAction = (data: any): void => {
  console.log("Game over!");
  console.log("data is", data);
}

export const playerAttemptAction: GameStateAction = (data: any): void => {
  console.log("Player attmpted swing!");
  console.log("data is", data);
}
export const playerAttemptActionServer: GameStateAction = (data: any): void => {
  console.log("Player attmpted swing!");
  console.log("data is", data);
}

export const playerScoreAction: GameStateAction = (data: any): void => {
  console.log("Player scored!");
  console.log("data is", data);
}
export const playerScoreActionServer: GameStateAction = (data: any): void => {
  console.log("Player scored!");
  console.log("data is", data);
}

export const DefaultGameMode: GameMode = {
  name: "Default",
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
  allowedPlayerActions: [],
  allowedHostActions: [
    DefaultGameStateAction.onGameStarted,
    DefaultGameStateAction.onGameEnded
  ],
  gameInitState: {
    'Playing': [],
    'Button': [ButtonUp],
    'Door': [Closed]
  },
  gamePlayerRoles: {
    'Playing': {
      'getVictory': []
    },
    'itsYourTurn': {
      'allowHitBall': []
    }
  },
  gameObjectsCleanState: {
    'Button': [HaveBeenInteracted]
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
