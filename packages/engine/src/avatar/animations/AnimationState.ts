import { AnimationAction, LoopOnce, LoopRepeat, MathUtils } from 'three'
import { Animation, AnimationType, WeightsParameterType, AvatarAnimations, AvatarStates } from './Util'

/** Class to hold state of an animation for entity */
export class AnimationState {
  /** Name of the animation state */
  name: string

  /** Type of the animation state */
  type: AnimationType = AnimationType.STATIC

  /** State to which transition can happen */
  nextStates: typeof AnimationState[] = []

  /** Animations of this state */
  animations: Animation[] = []

  /** Time elapsed since last weight update. */
  timeElapsedSinceUpdate: number = 0

  /** Duration for which transition from this state is paused */
  pauseTransitionDuration: number

  /** Duration in seconds after which the transition will be completed */
  transitionDuration = 1

  /** After finising the animation automatically transition to the given state */
  autoTransitionTo: string // TODO should autoTransitionTo be nullable?

  /** Parameters to update the weights of the animation in the state */
  weightParams: WeightsParameterType

  /** Plays the animations as soon as the state is mounted to keep animations in sync with each other */
  syncActions: boolean

  /** Updates the weight of all the animations in the state based on the params provided
   * @param params Params which will be used to calculate wieghts
   */
  updateWeights?: () => void

  /** Returns the total sum of weights all the animation at current time */
  getTotalWeightsOfAnimations = () => {
    let weight = 0
    this.animations.forEach((a) => (weight += Number.isNaN(a.weight) ? 0 : a.weight))

    return weight
  }
}

export class LoopableEmoteState extends AnimationState {
  name = AvatarStates.LOOPABLE_EMOTE
  type = AnimationType.STATIC
  animations: Animation[] = [
    {
      name: AvatarAnimations.DANCING_1,
      weight: 0,
      timeScale: 1,
      loopType: LoopRepeat
    },
    {
      name: AvatarAnimations.DANCING_2,
      weight: 0,
      timeScale: 1,
      loopType: LoopRepeat
    },
    {
      name: AvatarAnimations.DANCING_3,
      weight: 0,
      timeScale: 1,
      loopType: LoopRepeat
    },
    {
      name: AvatarAnimations.DANCING_4,
      weight: 0,
      timeScale: 1,
      loopType: LoopRepeat
    } as any
  ]

  updateWeights = (): void => {
    if (!this.weightParams.animationName) return

    this.weightParams.interpolate = true

    this.timeElapsedSinceUpdate = 0

    this.animations.forEach((a) => {
      if (this.weightParams.animationName === a.name) {
        a.transitionStartWeight = a.weight
        a.transitionEndWeight = 1
      } else {
        a.transitionStartWeight = a.weight
        a.transitionEndWeight = 0
      }
    })
  }
}

export class EmoteState extends AnimationState {
  name = AvatarStates.EMOTE
  type = AnimationType.STATIC
  pauseTransitionDuration = 10000
  animations: Animation[] = [
    {
      name: AvatarAnimations.CLAP,
      weight: 0,
      timeScale: 1,
      loopType: LoopOnce,
      decorateAction: function (action: AnimationAction) {
        //console.log('TEST: '+ this.loopType+' '+' '+this.loopCount);
        action.reset()
        action.setLoop(this.loopType, this.loopCount)
        action.clampWhenFinished = true
      }
    },
    {
      name: AvatarAnimations.CRY,
      weight: 0,
      timeScale: 1,
      loopType: LoopOnce,
      decorateAction: function (action: AnimationAction) {
        action.reset()
        action.setLoop(this.loopType, this.loopCount)
        action.clampWhenFinished = true
      }
    },
    {
      name: AvatarAnimations.KISS,
      weight: 0,
      timeScale: 1,
      loopType: LoopOnce,
      decorateAction: function (action: AnimationAction) {
        action.reset()
        action.setLoop(this.loopType, this.loopCount)
        action.clampWhenFinished = true
      }
    },
    {
      name: AvatarAnimations.WAVE,
      weight: 0,
      timeScale: 1,
      loopType: LoopOnce,
      decorateAction: function (action: AnimationAction) {
        action.reset()
        action.setLoop(this.loopType, this.loopCount)
        action.clampWhenFinished = true
      }
    },
    {
      name: AvatarAnimations.DEFEAT,
      weight: 0,
      timeScale: 1,
      loopType: LoopOnce,
      decorateAction: function (action: AnimationAction) {
        action.reset()
        action.setLoop(this.loopType, this.loopCount)
        action.clampWhenFinished = true
      }
    },
    {
      name: AvatarAnimations.LAUGH,
      weight: 0,
      timeScale: 1,
      loopType: LoopOnce,
      decorateAction: function (action: AnimationAction) {
        action.reset()
        action.setLoop(this.loopType, this.loopCount)
        action.clampWhenFinished = true
      }
    }
  ] as any

  updateWeights = (): void => {
    if (!this.weightParams.animationName) return

    this.weightParams.interpolate = true

    this.timeElapsedSinceUpdate = 0

    this.animations.forEach((a) => {
      if (this.weightParams.animationName === a.name) {
        a.transitionStartWeight = a.weight
        a.transitionEndWeight = 1
      } else {
        a.transitionStartWeight = a.weight
        a.transitionEndWeight = 0
      }
    })
  }
}

export class IdleState extends AnimationState {
  name = AvatarStates.IDLE
  type = AnimationType.VELOCITY_BASED
  transitionDuration = 0.5
  animations: Animation[] = [
    {
      name: AvatarAnimations.IDLE,
      weight: 1,
      timeScale: 1,
      loopType: LoopRepeat,
      loopCount: Infinity
    }
  ] as any

  updateWeights = (): void => {
    this.weightParams.interpolate = true
    this.animations[0].transitionStartWeight = this.animations[0].weight
    this.animations[0].transitionEndWeight = 1
  }
}

export class JumpState extends AnimationState {
  name = AvatarStates.JUMP
  type = AnimationType.VELOCITY_BASED
  transitionDuration = 0.2
  animations: Animation[] = [
    {
      name: AvatarAnimations.JUMP,
      weight: 1,
      timeScale: 1,
      loopType: LoopOnce,
      decorateAction: function (action: AnimationAction) {
        action.reset()
        action.setLoop(this.loopType, this.loopCount)
        action.clampWhenFinished = true
      }
    }
  ] as any

  updateWeights = (): void => {
    this.animations.forEach((a) => (a.weight = 1))
  }
}

export class WalkState extends AnimationState {
  name = AvatarStates.WALK
  type = AnimationType.VELOCITY_BASED
  syncActions = true
  animations: Animation[] = [
    { name: AvatarAnimations.WALK_FORWARD, weight: 0, timeScale: 1, loopType: LoopRepeat, loopCount: Infinity },
    { name: AvatarAnimations.WALK_BACKWARD, weight: 0, timeScale: 1, loopType: LoopRepeat, loopCount: Infinity },
    {
      name: AvatarAnimations.WALK_STRAFE_LEFT,
      weight: 0,
      timeScale: 1,
      loopType: LoopRepeat,
      loopCount: Infinity
    },
    {
      name: AvatarAnimations.WALK_STRAFE_RIGHT,
      weight: 0,
      timeScale: 1,
      loopType: LoopRepeat,
      loopCount: Infinity
    }
  ] as any

  updateWeights = (): void => {
    const { velocity, distanceFromGround } = this.weightParams.movement!

    const maxWeight = distanceFromGround ? 0.5 : 1 // In Air wieght

    if (velocity.x > 0) {
      this.animations[2].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.x, 0, 0.02, 0, maxWeight), 0, 1)
      this.animations[3].weight = 0
    } else {
      this.animations[3].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.x, 0, -0.02, 0, maxWeight), 0, 1)
      this.animations[2].weight = 0
    }

    if (velocity.z > 0) {
      this.animations[0].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.z, 0, 0.02, 0, maxWeight), 0, 1)
      this.animations[1].weight = 0
    } else {
      this.animations[1].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.z, 0, -0.02, 0, maxWeight), 0, 1)
      this.animations[0].weight = 0
    }
  }
}

export class RunState extends AnimationState {
  name = AvatarStates.RUN
  type = AnimationType.VELOCITY_BASED
  syncActions = true
  animations: Animation[] = [
    { name: AvatarAnimations.RUN_FORWARD, weight: 0, timeScale: 1, loopType: LoopRepeat, loopCount: Infinity },
    { name: AvatarAnimations.RUN_BACKWARD, weight: 0, timeScale: 1, loopType: LoopRepeat, loopCount: Infinity },
    { name: AvatarAnimations.RUN_STRAFE_LEFT, weight: 0, timeScale: 1, loopType: LoopRepeat, loopCount: Infinity },
    { name: AvatarAnimations.RUN_STRAFE_RIGHT, weight: 0, timeScale: 1, loopType: LoopRepeat, loopCount: Infinity }
  ] as any

  updateWeights = (): void => {
    const { velocity, distanceFromGround } = this.weightParams.movement!

    const maxWeight = distanceFromGround ? 0.5 : 1 // In Air wieght

    if (velocity.x > 0) {
      this.animations[2].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.x, 0, 0.04, 0, maxWeight), 0, 1)
      this.animations[3].weight = 0
    } else {
      this.animations[3].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.x, 0, -0.04, 0, maxWeight), 0, 1)
      this.animations[2].weight = 0
    }

    if (velocity.z > 0) {
      this.animations[0].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.z, 0, 0.08, 0, maxWeight), 0, 1)
      this.animations[1].weight = 0
    } else {
      this.animations[1].weight = MathUtils.clamp(MathUtils.mapLinear(velocity.z, 0, -0.08, 0, maxWeight), 0, 1)
      this.animations[0].weight = 0
    }
  }
}
