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

import { updateDistanceMatchingAction, updateFollowerAction } from './DistanceMatchingAction'

describe('updateFollowerAction', () => {
  it('Tests updateFollowerAction', () => {
    const leadAction = {
      action: {
        time: 2,
        getClip() {
          return { duration: 4 }
        }
      },
      distanceTrack: {},
      distanceTraveled: 0
    }
    const followerAction = {
      action: {
        time: 0,
        getClip() {
          return { duration: 2 }
        }
      },
      distanceTrack: { values: [0, 3, 6], times: [0, 1, 2] },
      distanceTraveled: 0
    }

    updateFollowerAction(leadAction as any, followerAction as any)

    assert(Math.abs(followerAction.action.time - 1) < 0.001)
    assert(Math.abs(followerAction.distanceTraveled - 3) < 0.001)
  })
})

describe('updateDistanceMatchingAction', () => {
  it('Tests updateDistanceMatchingAction', () => {
    const action = {
      action: {
        time: 0,
        getClip() {
          return { duration: 2 }
        }
      },
      distanceTrack: { values: [0, 2, 4], times: [0, 1, 2] },
      distanceTraveled: 4
    }

    updateDistanceMatchingAction(action as any, 1)
    assert(Math.abs(action.distanceTraveled - 1) < 0.001)
    assert(Math.abs(action.action.time - 0.5) < 0.001)
  })
})
