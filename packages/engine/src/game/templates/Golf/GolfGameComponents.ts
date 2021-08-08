import { createMappedComponent } from '../../../ecs/functions/EntityFunctions'
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

export const Goal = createMappedComponent<{}>()

export const Hit = createMappedComponent<{}>()
export const AlreadyHit = createMappedComponent<{}>()

export const BallMoving = createMappedComponent<{}>()
export const AlmostStopped = createMappedComponent<{}>()
export const BallStopped = createMappedComponent<{}>()

export const BallHidden = createMappedComponent<{}>()
export const BallVisible = createMappedComponent<{}>()

export const CorrectBallPosition = createMappedComponent<{}>()
export const CheckCourse = createMappedComponent<{}>()

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
