import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Vector2, Vector3 } from 'three'

import { enterLocomotionState, getLocomotionStateActions, updateLocomotionStateBlendValues } from './locomotionState'

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

describe('updateLocomotionStateBlendValues', () => {
  it('Will test blend values', () => {
    const locomotion = new Vector3(1, 1, 1)

    const state = {
      blendValue: new Vector2(),
      frameBlendValue: new Vector2(),
      locomotion
    }

    const delta = 0.6
    updateLocomotionStateBlendValues(state as any, delta)

    assert.equal(state.blendValue.x, locomotion.x)
    assert.equal(state.blendValue.y, locomotion.z)
    assert.equal(state.frameBlendValue.x, locomotion.x * delta)
    assert.equal(state.frameBlendValue.y, locomotion.y * delta)
  })
})
