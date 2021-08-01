import { Component } from '../../../ecs/classes/Component'
/**
 * @author HydraFire <github.com/HydraFire>
 */
// its for adding new Action in State in One Plase, please don't splite this
export enum GolfGameStates {
  Goal = 'Goal',

  Hit = 'Hit',
  AlreadyHit = 'AlreadyHit',

  BallMoving = 'BallMoving',
  AlmostStopped = 'AlmostStopped',
  BallStopped = 'BallStopped',

  BallHidden = 'BallHidden',
  BallVisible = 'BallVisible',

  CorrectBallPosition = 'CorrectBallPosition',
  CheckCourse = 'CheckCourse'
}

export class Goal extends Component<Goal> {}

export class Hit extends Component<Hit> {}
export class AlreadyHit extends Component<AlreadyHit> {}

export class BallMoving extends Component<BallMoving> {}
export class AlmostStopped extends Component<AlmostStopped> {}
export class BallStopped extends Component<BallStopped> {}

export class BallHidden extends Component<BallHidden> {}
export class BallVisible extends Component<BallVisible> {}

export class CorrectBallPosition extends Component<CorrectBallPosition> {}
export class CheckCourse extends Component<CheckCourse> {}

export const GolfState = {
  [GolfGameStates.Goal]: Goal,
  [GolfGameStates.Hit]: Hit,
  [GolfGameStates.AlreadyHit]: AlreadyHit,
  [GolfGameStates.BallMoving]: BallMoving,
  [GolfGameStates.AlmostStopped]: AlmostStopped,
  [GolfGameStates.BallStopped]: BallStopped,
  [GolfGameStates.BallHidden]: BallHidden,
  [GolfGameStates.BallVisible]: BallVisible,
  [GolfGameStates.CorrectBallPosition]: CorrectBallPosition,
  [GolfGameStates.CheckCourse]: CheckCourse
}
