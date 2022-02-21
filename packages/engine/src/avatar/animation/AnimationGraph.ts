import { AnimationState } from './AnimationState'

class AnimationStateTransitionRule {
  nextState: AnimationState

  canEnterTransition(): boolean {
    return false
  }
}

/** Base Class which hold the animation graph for entity. Animation graph will resides in Animation Component. */
export class AnimationGraph {
  /** All the possible states of this graph */
  states: { [key: string]: AnimationState } = {}

  transitionRules: { [key: string]: AnimationStateTransitionRule[] }

  /** Current state */
  currentState: AnimationState

  constructor() {
    this.transitionRules = {}
    this.states = {}
  }

  update = (delta: number): void => {
    if (this.currentState) {
      const transitions = this.transitionRules[this.currentState.name]

      if (transitions) {
        for (const rule of transitions) {
          if (rule.canEnterTransition() && rule.nextState) {
            const prevState = this.currentState
            this.currentState?.exit()
            this.currentState = rule.nextState
            this.currentState.enter(prevState)
          }
        }
      }
    }

    if (this.currentState) this.currentState.update(delta)
  }

  addStateChangeHandler = (): void => {
    // Todo: replace the updateNetwork with events
  }
}
