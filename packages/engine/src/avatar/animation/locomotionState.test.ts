import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Vector2, Vector3 } from 'three'

import {
  enterLocomotionState,
  getLocomotionStateActions,
  LocomotionState,
  updateLocomotionStateBlendValues
} from './locomotionState'

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
    const velocity = new Vector3(1, 1, 1)

    const state = {
      movementParams: { velocity },
      blendValue: new Vector2(),
      frameBlendValue: new Vector2()
    }

    updateLocomotionStateBlendValues(state as any, 2)

    assert(Math.abs(60 - state.blendValue.x) < 0.001)
    assert(Math.abs(60 - state.blendValue.y) < 0.001)
    assert(Math.abs(120 - state.frameBlendValue.x) < 0.001)
    assert(Math.abs(120 - state.frameBlendValue.y) < 0.001)
  })
})
