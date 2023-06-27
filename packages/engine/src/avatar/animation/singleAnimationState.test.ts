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
