import { AnimationAction, Vector3 } from 'three'

export class AnimationStateTransitionRule {
  // TODO: Should move the next state value somewhere else
  // Probably to animation graph
  nextState: string

  constructor(nextState: string) {
    this.nextState = nextState
  }

  canEnterTransition(): boolean {
    return false
  }
}

// Combines multiple transition rules into one
export class CompositeTransitionRule extends AnimationStateTransitionRule {
  rules: AnimationStateTransitionRule[]
  operator: boolean // True === and

  constructor(nextState: string, operator: 'and' | 'or', ...rules: AnimationStateTransitionRule[]) {
    super(nextState)
    this.rules = rules
    this.operator = operator === 'and'
  }

  canEnterTransition(): boolean {
    let result = false

    for (const rule of this.rules) {
      result = rule.canEnterTransition()

      if (this.operator) {
        if (!result) break
      } else if (result) {
        break
      }
    }

    return result
  }
}

// Allows state transition based on an object's property
export class BooleanTransitionRule extends AnimationStateTransitionRule {
  object: any
  property: string
  negate: boolean

  constructor(nextState: string, object: any, property: string, negate: boolean = false) {
    super(nextState)
    this.object = object
    this.property = property
    this.negate = negate
  }
  canEnterTransition(): boolean {
    const value = this.object[this.property]
    return this.negate ? !value : value
  }
}

// Allows state transition if animation time is past certain percentage
export class AnimationTimeTransitionRule extends AnimationStateTransitionRule {
  action: AnimationAction
  threshold: number

  constructor(nextState: string, action: AnimationAction, threshold: number = 0.9) {
    super(nextState)
    this.action = action
    this.threshold = threshold
  }

  canEnterTransition(): boolean {
    const ratio = this.action.time / this.action.getClip().duration
    return ratio > this.threshold
  }
}

export class VectorLengthTransitionRule extends AnimationStateTransitionRule {
  velocity: Vector3
  threshold: number

  constructor(nextState: string, velocity: Vector3, threshold: number = 0.001) {
    super(nextState)
    this.velocity = velocity
    this.threshold = threshold
  }

  canEnterTransition(): boolean {
    return this.velocity.lengthSq() >= this.threshold
  }
}
