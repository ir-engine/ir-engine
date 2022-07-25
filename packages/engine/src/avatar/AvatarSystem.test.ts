import assert from 'assert'
import sinon from 'sinon'
import { Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { addComponent, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { createEngine } from '../initializeEngine'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { XRHandsInputComponent, XRInputSourceComponent } from '../xr/XRComponents'
import { setupXRInputSourceComponent } from '../xr/XRFunctions'
import {
  avatarDetailsReceptor,
  setupHandIK,
  setupHeadIK,
  setupXRInputSourceContainer,
  teleportObjectReceptor,
  xrHandsConnectedReceptor,
  xrInputQueryExit
} from './AvatarSystem'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarHandsIKComponent } from './components/AvatarHandsIKComponent'
import { AvatarHeadIKComponent } from './components/AvatarHeadIKComponent'

describe('AvatarSystem', async () => {
  beforeEach(async () => {
    createEngine()
  })

  it('check setupXRInputSourceContainer', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const {
      controllerLeftParent,
      controllerGripLeftParent,
      controllerRightParent,
      controllerGripRightParent,
      head,
      container
    } = setupXRInputSourceComponent(entity)

    setupXRInputSourceContainer(entity)

    const scene = Engine.instance.currentWorld.scene

    assert(controllerLeftParent.parent === container)
    assert(controllerGripLeftParent.parent === container)
    assert(controllerRightParent.parent === container)
    assert(controllerGripRightParent.parent === container)
    assert(container.parent === scene)
    assert(head.parent === scene)
  })

  it('check setupHeadIK', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const { head } = setupXRInputSourceComponent(entity)
    setupHeadIK(entity)
    const headIKComponent = getComponent(entity, AvatarHeadIKComponent)
    assert(headIKComponent)
    assert(headIKComponent.camera === head)
  })

  it('check setupHandIK', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    setupXRInputSourceComponent(entity)
    setupHandIK(entity)
    const ik = getComponent(entity, AvatarHandsIKComponent)
    assert(ik)
    assert(ik.leftTarget)
    assert(ik.rightTarget)
  })

  it('check xrInputQueryExit', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const xrInput = setupXRInputSourceComponent(entity)

    setupXRInputSourceContainer(entity)
    setupHeadIK(entity)
    setupHandIK(entity)
    ;(XRInputSourceComponent as any)._setPrevious(entity, xrInput)
    xrInputQueryExit(entity)

    assert(!xrInput.container.parent)
    assert(!xrInput.head.parent)
    assert(!hasComponent(entity, AvatarHeadIKComponent))
    assert(!hasComponent(entity, AvatarHandsIKComponent))
  })

  it('check setXRModeReceptor', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const actionStub = { enabled: true } as any
    const worldStub = {
      getUserAvatarEntity() {
        return entity
      }
    } as any

    setXRModeReceptor(actionStub, worldStub)
    assert(hasComponent(entity, XRInputSourceComponent))
    actionStub.enabled = false
    setXRModeReceptor(actionStub, worldStub)
    assert(!hasComponent(entity, XRInputSourceComponent))
  })

  it('check xrHandsConnectedReceptor', async () => {
    const world = Engine.instance.currentWorld
    Engine.instance.userId = 'user' as UserId
    let entity = 0 as any
    const actionStub = { $from: Engine.instance.userId } as any
    const worldStub = {
      getUserAvatarEntity() {
        return entity
      }
    } as any

    assert(xrHandsConnectedReceptor(actionStub, worldStub) === false)
    actionStub.$from = 'other'
    assert(xrHandsConnectedReceptor(actionStub, worldStub) === false)
    entity = createEntity(world)
    assert(xrHandsConnectedReceptor(actionStub, worldStub))
    assert(hasComponent(entity, XRHandsInputComponent))
  })

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

  it('check teleportObjectReceptor', async () => {
    const action = { pose: [1, 2, 3], object: { ownerId: 0, networkId: 0 } } as any
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const worldStub = { getNetworkObject: () => entity } as any

    const controller = { controller: { setPosition: () => {} } } as any
    sinon.spy(controller.controller, 'setPosition')

    addComponent(entity, AvatarControllerComponent, controller)
    const avatar = { avatarHalfHeight: 1 } as any
    addComponent(entity, AvatarComponent, avatar)
    const velocity = { linear: new Vector3().setScalar(1), angular: new Vector3().setScalar(1) } as any
    addComponent(entity, VelocityComponent, velocity)

    teleportObjectReceptor(action, worldStub)

    assert(controller.controller.setPosition.calledOnce)
    const setPositionArg = controller.controller.setPosition.getCall(0).args[0]
    assert(setPositionArg.x === action.pose[0])
    assert(setPositionArg.y === action.pose[1] + avatar.avatarHalfHeight)
    assert(setPositionArg.z === action.pose[2])
    assert(velocity.linear.length() === 0)
    assert(velocity.angular.length() === 0)
  })
})
