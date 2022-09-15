import { noop } from 'lodash'

import multiLogger from '@xrengine/common/src/logger'

import { Entity } from '../../ecs/classes/Entity'

export interface State {
  name: string
  execute: StateBehaviorFunction
  enter: StateBehaviorFunction
  exit: StateBehaviorFunction
  transitions: StateTransition[]
}

export interface StateTransition {
  description: string
  test: StateTransitionTestFunction
  getState: () => State
}

export interface StateBehaviorFunction {
  (entity: Entity): void
}

export interface StateTransitionTestFunction {
  (entity: Entity): boolean
}

interface StateBuilder extends State {
  addTransition(t: StateTransition): StateBuilder
  completeBuild(): State
}

export function buildState(
  name: string,
  execute: StateBehaviorFunction = noop,
  enter: StateBehaviorFunction = noop,
  exit: StateBehaviorFunction = noop
): StateBuilder {
  return {
    name,
    execute,
    enter,
    exit,
    transitions: [],
    addTransition(t: StateTransition) {
      this.transitions.push(t)
      return this
    },
    completeBuild() {
      this.transitions = Object.freeze(this.transitions)
      return Object.freeze(this)
    }
  }
}

export function step(start: State, entity: Entity): State {
  start.execute(entity)
  // Take first transition that passes its test
  for (let transition of start.transitions) {
    const result = transition.test(entity)
    if (result) {
      const next = transition.getState()
      multiLogger.debug('LEAVING', start.name, 'STATE, ENTERING', next.name, 'STATE\nBECAUSE', transition.description)
      start.exit(entity)
      next.enter(entity)
      return next
    }
  }
  multiLogger.debug('NO TRANSITIONS POSSIBLE')
  return start
}
