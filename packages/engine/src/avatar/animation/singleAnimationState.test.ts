import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { AnimationAction, LoopOnce, LoopRepeat } from 'three'

import { getSingleAnimationStateActions, SingleAnimationState } from './singleAnimationState'

describe('getSingleAnimationStateActions', () => {
  it('Will return array of one action', () => {
    const action = {}
    const testState: SingleAnimationState = {
      name: 'TestState',
      type: 'SingleAnimationState',
      action: action as AnimationAction,
      loop: false,
      clamp: false
    }

    const returnedActions = getSingleAnimationStateActions(testState)
    assert(Array.isArray(returnedActions))
    assert(returnedActions.length === 1)
    assert(returnedActions[0] === action)
  })
})

describe('enterSingleAnimationState', () => {
  it('Will test enterSingleAnimationState loop', () => {
    const action = {
      clampWhenFinished: false,
      reset() {
        return this
      },
      setLoop(a, b) {
        return this
      },
      fadeIn(a) {
        return this
      },
      play() {
        return this
      }
    } as any

    sinon.spy(action)

    const testState: SingleAnimationState = {
      name: 'TestState',
      type: 'SingleAnimationState',
      action: action as AnimationAction,
      loop: true,
      clamp: false
    }

    const animationStateStub = {} as any
    const { enterSingleAnimationState } = proxyquire('./singleAnimationState', {
      './AnimationState': animationStateStub
    })
    sinon.spy(animationStateStub, 'fadeOutAnimationStateActions')

    enterSingleAnimationState(testState, null)
    assert(animationStateStub.fadeOutAnimationStateActions.calledOnce)
    assert(action.reset.calledOnce)
    assert(action.setLoop.calledOnce)
    assert(action.fadeIn.calledOnce)
    assert(action.play.calledOnce)
    assert(action.setLoop.calledWith(LoopRepeat, Infinity))
    assert(action.clampWhenFinished === false)

    testState.loop = false
    testState.clamp = true

    enterSingleAnimationState(testState, null)
    const setLoopCall = action.setLoop.getCall(-1)
    assert(animationStateStub.fadeOutAnimationStateActions.calledTwice)
    assert(action.reset.calledTwice)
    assert(action.setLoop.calledTwice)
    assert(action.fadeIn.calledTwice)
    assert(action.play.calledTwice)
    assert(setLoopCall.args[0] === LoopOnce)
    assert(setLoopCall.args[1] === 1)
    assert(action.clampWhenFinished === true)
  })
})
