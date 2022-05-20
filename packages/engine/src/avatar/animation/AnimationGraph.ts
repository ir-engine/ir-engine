/** Animation graph for entity. */
import { AnimationState, enterAnimationState, updateAnimationState } from './AnimationState'
import { AnimationStateTransitionRule, canEnterTransition } from './AnimationStateTransitionsRule'

export type AnimationGraph = {
  states: { [key: string]: AnimationState }
  transitionRules: { [key: string]: { rule: AnimationStateTransitionRule; nextState: string }[] }
  currentState: AnimationState
}

export function updateAnimationGraph(graph: AnimationGraph, delta: number) {
  if (graph.currentState) {
    const transitions = graph.transitionRules[graph.currentState.name]

    if (transitions) {
      for (const { rule, nextState } of transitions) {
        if (canEnterTransition(rule) && nextState) {
          changeState(graph, nextState)
        }
      }
    }
  }

  updateAnimationState(graph.currentState, delta)
}

export function changeState(graph: AnimationGraph, name: string): void {
  const newState = graph.states[name]
  if ((graph.currentState && graph.currentState.type === name) || !newState) return
  const prevState = graph.currentState
  graph.currentState = newState
  enterAnimationState(graph.currentState, prevState)
}
