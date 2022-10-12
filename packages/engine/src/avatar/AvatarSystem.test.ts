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

  // it('check setupXRInputSourceContainer', async () => {
  //   const world = Engine.instance.currentWorld
  //   const entity = createEntity(world)
  //   const {
  //     controllerLeftParent,
  //     controllerGripLeftParent,
  //     controllerRightParent,
  //     controllerGripRightParent,
  //     head,
  //     container
  //   } = setupXRInputSourceComponent(entity)

  //   setupXRInputSourceContainer(entity)

  //   const scene = Engine.instance.currentWorld.scene

  //   assert(controllerLeftParent.parent === container)
  //   assert(controllerGripLeftParent.parent === container)
  //   assert(controllerRightParent.parent === container)
  //   assert(controllerGripRightParent.parent === container)
  //   assert(container.parent === scene)
  //   assert(head.parent === scene)
  // })

  // it('check setupHeadIK', async () => {
  //   const world = Engine.instance.currentWorld
  //   const entity = createEntity(world)
  //   const { head } = setupXRInputSourceComponent(entity)
  //   setupHeadIK(entity)
  //   const headIKComponent = getComponent(entity, AvatarHeadIKComponent)
  //   assert(headIKComponent)
  //   assert(headIKComponent.camera === head)
  // })

  // it('check setupHandIK', async () => {
  //   const world = Engine.instance.currentWorld
  //   const entity = createEntity(world)
  //   setupXRInputSourceComponent(entity)
  //   setupHandIK(entity)
  //   const ik = getComponent(entity, AvatarHandsIKComponent)
  //   assert(ik)
  //   assert(ik.leftTarget)
  //   assert(ik.rightTarget)
  // })

  // it('check xrInputQueryExit', async () => {
  //   const world = Engine.instance.currentWorld
  //   const entity = createEntity(world)
  //   const xrInput = setupXRInputSourceComponent(entity)

  //   setupXRInputSourceContainer(entity)
  //   setupHeadIK(entity)
  //   setupHandIK(entity)
  //   xrInputQueryExit(entity)

  //   assert(!xrInput.container.parent)
  //   assert(!xrInput.head.parent)
  //   assert(!hasComponent(entity, AvatarHeadIKComponent))
  //   assert(!hasComponent(entity, AvatarHandsIKComponent))
  // })

  // // it('check setXRModeReceptor', async () => {
  // //   const entity = createEntity()
  // //   xrSessionChanged(XRAction.sessionChanged({ active: true }))
  // //   assert(hasComponent(entity, XRInputSourceComponent))
  // //   xrSessionChanged(XRAction.sessionChanged({ active: false }))
  // //   assert(!hasComponent(entity, XRInputSourceComponent))
  // // })

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
