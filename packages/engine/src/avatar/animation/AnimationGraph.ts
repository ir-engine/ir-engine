import { AnimationState } from './AnimationState'
import { AnimationStateTransitionRule } from './AnimationStateTransitionsRule'

/** Base Class which hold the animation graph for entity. Animation graph will resides in Animation Component. */
export class AnimationGraph {
  /** All the possible states of this graph */
  states: { [key: string]: AnimationState } = {}

  transitionRules: { [key: string]: AnimationStateTransitionRule[] }

  /** Current state */
  currentState: AnimationState

  stateChangeHandlers: any[]

  constructor() {
    this.transitionRules = {}
    this.states = {}
    this.stateChangeHandlers = []
  }

  update(delta: number): void {
    if (this.currentState) {
      const transitions = this.transitionRules[this.currentState.name]

      if (transitions) {
        for (const rule of transitions) {
          if (rule.canEnterTransition() && rule.nextState) {
            this.changeState(rule.nextState)
          }
        }
      }
    }

    this.currentState?.update(delta)
  }

  changeState(name: string): void {
    const newState = this.states[name]
    if ((this.currentState && this.currentState.name === name) || !newState) return
    const prevState = this.currentState
    this.currentState?.exit()
    this.currentState = newState
    this.currentState.enter(prevState)
    this.stateChangeHandlers.forEach((callback) => {
      callback(name)
    })
  }

  addStateChangeListner(listner) {
    if (typeof listner !== 'function' || this.stateChangeHandlers.includes(listner)) return
    this.stateChangeHandlers.push(listner)
  }

  removeStateChangeListner(listner) {
    const index = this.stateChangeHandlers.indexOf(listner)
    if (index > -1) {
      this.stateChangeHandlers.splice(index, 1)
    }
  }
}
