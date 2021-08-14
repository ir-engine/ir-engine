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
;(Goal as any).name = 'Goal'

export const Hit = createMappedComponent<{}>()
;(Hit as any).name = 'Hit'
export const AlreadyHit = createMappedComponent<{}>()
;(AlreadyHit as any).name = 'AlreadyHit'

export const BallMoving = createMappedComponent<{}>()
;(BallMoving as any).name = 'BallMoving'
export const AlmostStopped = createMappedComponent<{}>()
;(AlmostStopped as any).name = 'AlmostStopped'
export const BallStopped = createMappedComponent<{}>()
;(BallStopped as any).name = 'BallStopped'

export const BallHidden = createMappedComponent<{}>()
;(BallHidden as any).name = 'BallHidden'
export const BallVisible = createMappedComponent<{}>()
;(BallVisible as any).name = 'BallVisible'

export const CorrectBallPosition = createMappedComponent<{}>()
;(CorrectBallPosition as any).name = 'CorrectBallPosition'
export const CheckCourse = createMappedComponent<{}>()
;(CheckCourse as any).name = 'CheckCourse'

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
