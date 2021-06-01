// Action Components
import { HasHadInteraction } from "../actions/HasHadInteraction";
import { GameObjectCollisionTag } from "../actions/GameObjectCollisionTag";
import { BallMoving } from "../actions/BallMoving";
import { BallStopped } from "../actions/BallStopped";
// State TagComponents
import { SpawnedObject } from '../templates/gameDefault/components/SpawnedObjectTagComponent';
import { ButtonDown } from '../templates/gameDefault/components/ButtonDownTagComponent';
import { ButtonUp } from '../templates/gameDefault/components/ButtonUpTagComponent';
import { Closed } from '../templates/gameDefault/components/ClosedTagComponent';
import { Open } from '../templates/gameDefault/components/OpenTagComponent';
import { PanelDown } from '../templates/gameDefault/components/PanelDownTagComponent';
import { PanelUp } from '../templates/gameDefault/components/PanelUpTagComponent';
import { YourTurn } from '../templates/Golf/components/YourTurnTagComponent';
import { Goal } from '../templates/Golf/components/GoalTagComponent';
import { Active } from "../templates/gameDefault/components/ActiveTagComponent";
import { Inactive } from "../templates/gameDefault/components/InactiveTagComponent";
/**
 * @author HydraFire <github.com/HydraFire>
 */
// its for adding new Action in State in One Plase, please don't splite this
enum gameActions {
    HasHadInteraction = 'HasHadInteraction',
    GameObjectCollisionTag = 'GameObjectCollisionTag',
    BallMoving = 'BallMoving',
    BallStopped = 'BallStopped'
}

export const Action = {
    [gameActions.HasHadInteraction]: HasHadInteraction,
    [gameActions.GameObjectCollisionTag]: GameObjectCollisionTag,
    [gameActions.BallMoving]: BallMoving,
    [gameActions.BallStopped]: BallStopped
}
// its for adding new Action in State in One Plase, please don't splite this
enum gameStates {
    Active = 'Active',
    Inactive = 'Inactive',
    Open = 'Open',
    Closed = 'Closed',
    ButtonUp = 'ButtonUp',
    ButtonDown = 'ButtonDown',
    PanelUp = 'PanelUp',
    PanelDown = 'PanelDown',
    YourTurn = 'YourTurn',
    Goal = 'Goal',
    SpawnedObject = 'SpawnedObject'
}

export const State = {
    [gameStates.Active]: Active,
    [gameStates.Inactive]: Inactive,
    [gameStates.Open]: Open,
    [gameStates.Closed]: Closed,
    [gameStates.ButtonUp]: ButtonUp,
    [gameStates.ButtonDown]: ButtonDown,
    [gameStates.PanelUp]: PanelUp,
    [gameStates.PanelDown]: PanelDown,
    [gameStates.YourTurn]: YourTurn,
    [gameStates.Goal]: Goal,
    [gameStates.SpawnedObject]: SpawnedObject
};
