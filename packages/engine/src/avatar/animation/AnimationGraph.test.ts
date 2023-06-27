/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
