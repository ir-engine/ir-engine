// Action Components
import { HaveBeenInteracted } from "../actions/HaveBeenInteracted";
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
import { Deactive } from "../templates/gameDefault/components/DeactiveTagComponent";
/**
 * @author HydraFire <github.com/HydraFire>
 */
// its for adding new Action in State in One Plase, please don't splite this
enum gameActions {
    HaveBeenInteracted = 'HaveBeenInteracted',
    GameObjectCollisionTag = 'GameObjectCollisionTag',
    BallMoving = 'BallMoving',
    BallStopped = 'BallStopped'
}

export const Action = {
    [gameActions.HaveBeenInteracted]: HaveBeenInteracted,
    [gameActions.GameObjectCollisionTag]: GameObjectCollisionTag,
    [gameActions.BallMoving]: BallMoving,
    [gameActions.BallStopped]: BallStopped
}
// its for adding new Action in State in One Plase, please don't splite this
enum gameStates {
    Active = 'Active',
    Deactive = 'Deactive',
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
    [gameStates.Deactive]: Deactive,
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
