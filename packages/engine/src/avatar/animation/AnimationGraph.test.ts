import assert from 'assert'
import proxyquire from 'proxyquire'

import { AnimationGraph } from './AnimationGraph'
import { booleanTransitionRule } from './AnimationStateTransitionsRule'
import { SingleAnimationState } from './singleAnimationState'

describe('AnimationGraph changeState', () => {
  it('Will change current null state to new state', () => {
    const testState: SingleAnimationState = {
      name: 'TestState',
      type: 'SingleAnimationState',
      action: null!,
      loop: false,
      clamp: false
    }

    const graph: AnimationGraph = {
      states: { TestState: testState },
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    }

    const animationStateStub = {} as any
    const { changeState } = proxyquire('./AnimationGraph', { './AnimationState': animationStateStub })
    animationStateStub.enterAnimationState = () => {}

    changeState(graph, testState.name)
    assert(graph.currentState === testState, 'Current state is not changed')
  })

  it('Current state will not change ', () => {
    const testState: SingleAnimationState = {
      name: 'TestState',
      type: 'SingleAnimationState',
      action: null!,
      loop: false,
      clamp: false
    }

    const graph: AnimationGraph = {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    }

    const animationStateStub = {} as any
    const { changeState } = proxyquire('./AnimationGraph', { './AnimationState': animationStateStub })
    let enterAnimationStateCalled = false
    animationStateStub.enterAnimationState = () => {
      enterAnimationStateCalled = true
    }

    changeState(graph, testState.name)
    assert(graph.currentState === null, 'State is changed')
    assert(enterAnimationStateCalled === false, 'State is changed')

    graph.states[testState.name] = testState
    graph.currentState = testState
    changeState(graph, testState.name)
    assert(enterAnimationStateCalled === false, 'State is changed')
  })
})

describe('AnimationGraph updateAnimationGraph', () => {
  it('Will update animation state', () => {
    const graph: AnimationGraph = {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    }

    const animationStateStub = {} as any
    const { updateAnimationGraph } = proxyquire('./AnimationGraph', { './AnimationState': animationStateStub })
    let updateAnimationStateCalled = false
    animationStateStub.updateAnimationState = () => {
      updateAnimationStateCalled = true
    }

    updateAnimationGraph(graph, 0)
    assert(updateAnimationStateCalled, 'Animation state update not called')
  })

  it('Will not change animation state', () => {
    const graph: AnimationGraph = {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    }

    const animationStateStub = {} as any
    const { updateAnimationGraph } = proxyquire('./AnimationGraph', { './AnimationState': animationStateStub })
    let changeStateCalled = false
    animationStateStub.changeState = () => {
      changeStateCalled = true
    }

    updateAnimationGraph(graph, 0)
    assert(changeStateCalled === false, 'Animation state changed')

    const testState: SingleAnimationState = {
      name: 'TestState',
      type: 'SingleAnimationState',
      action: null!,
      loop: false,
      clamp: false
    }

    graph.states[testState.name] = testState
    graph.currentState = testState

    updateAnimationGraph(graph, 0)
    assert(changeStateCalled === false, 'Animation state changed')
  })

  it('Will change animation state', () => {
    const state1 = {
      name: 'TestState1',
      type: 'SingleAnimationState',
      action: null!,
      loop: false,
      clamp: false
    }
    const state2 = {
      name: 'TestState2',
      type: 'SingleAnimationState',
      action: null!,
      loop: false,
      clamp: false
    }

    const graph: AnimationGraph = {
      states: {},
      transitionRules: {},
      currentState: state1,
      stateChanged: null!
    }

    graph.states[state1.name] = state1
    graph.states[state2.name] = state2

    graph.transitionRules[state1.name] = [
      {
        rule: booleanTransitionRule({ val: true }, 'val'),
        nextState: state2.name
      }
    ]

    const animationStateStub = {} as any
    const { updateAnimationGraph } = proxyquire('./AnimationGraph', { './AnimationState': animationStateStub })
    animationStateStub.enterAnimationState = () => {}

    updateAnimationGraph(graph, 0)
    assert(graph.currentState === state2, 'Animation state change not called')
  })
})
