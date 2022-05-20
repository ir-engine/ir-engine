import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

import { enterLocomotionState, getLocomotionStateActions } from './locomotionState'

describe('getLocomotionStateActions', () => {
  it('Will return array of multiple actions', () => {
    const state = {
      forwardMovementActions: [{}],
      sideMovementActions: [{}],
      idleAction: {}
    }

    const returnedActions = getLocomotionStateActions(state as any)
    assert(Array.isArray(returnedActions))
    assert(returnedActions.length === 3)
  })
})

describe('enterLocomotionState', () => {
  it('Will fade-in all actions', () => {
    const action1 = {
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

    const action2 = Object.assign({}, action1)
    const action3 = Object.assign({}, action1)

    sinon.spy(action1)
    sinon.spy(action2)
    sinon.spy(action3)

    const state = {
      forwardMovementActions: [{ action: action1 }],
      sideMovementActions: [{ action: action2 }],
      idleAction: action3
    }

    enterLocomotionState(state as any)
    for (const action of [action1, action2, action3]) {
      assert(action.reset.calledOnce)
      assert(action.play.calledOnce)
      assert(action.fadeIn.calledOnce)
    }
  })
})

describe('updateLocomotionState', () => {
  it('Will fade-in all actions', () => {})
})
