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
