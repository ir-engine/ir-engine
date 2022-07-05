import assert from 'assert'

import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Engine } from '../ecs/classes/Engine'
import { getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { createEngine } from '../initializeEngine'
import { XRHandsInputComponent } from '../xr/components/XRHandsInputComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { setupXRInputSourceComponent } from '../xr/functions/WebXRFunctions'
import {
  setupHandIK,
  setupHeadIK,
  setupXRInputSourceContainer,
  setXRModeReceptor,
  xrHandsConnectedReceptor,
  xrInputQueryExit
} from './AvatarSystem'
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
})
