import assert from 'assert'

import { getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { createEngine } from '../initializeEngine'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import { avatarDetailsReceptor } from './AvatarSystem'

describe('AvatarSystem', async () => {
  beforeEach(async () => {
    createEngine()
  })

  // it('check xrHandsConnectedReceptor', async () => {
  //   const world = Engine.instance.currentWorld
  //   Engine.instance.userId = 'user' as UserId
  //   let entity = 0 as any
  //   const actionStub = { $from: Engine.instance.userId } as any
  //   const worldStub = {
  //     getUserAvatarEntity() {
  //       return entity
  //     }
  //   } as any

  //   assert(xrHandsConnectedReceptor(actionStub, worldStub) === false)
  //   actionStub.$from = 'other'
  //   assert(xrHandsConnectedReceptor(actionStub, worldStub) === false)
  //   entity = createEntity(world)
  //   assert(xrHandsConnectedReceptor(actionStub, worldStub))
  //   assert(hasComponent(entity, XRHandsInputComponent))
  // })

  it('check avatarDetailsReceptor', async () => {
    const action = WorldNetworkAction.avatarDetails({
      avatarDetail: {
        avatarURL: 'model',
        thumbnailURL: 'thumbnail'
      }
    })

    avatarDetailsReceptor(action)

    const worldState = getState(WorldState)
    assert.deepEqual(worldState.userAvatarDetails[Engine.instance.userId].value, action.avatarDetail)
  })
})
