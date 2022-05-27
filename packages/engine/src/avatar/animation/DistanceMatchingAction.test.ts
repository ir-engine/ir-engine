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
