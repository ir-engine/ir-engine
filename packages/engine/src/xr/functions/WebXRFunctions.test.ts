import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { PerspectiveCamera } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { FollowCameraComponent, FollowCameraDefaultValues } from '../../camera/components/FollowCameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XRHandsInputComponent } from '../components/XRHandsInputComponent'
import { XRInputSourceComponent } from '../components/XRInputSourceComponent'
import { setupXRCameraForLocalEntity, setupXRInputSourceComponent } from './WebXRFunctions'

describe('WebXRFunctions Unit', async () => {
  beforeEach(async () => {
    createEngine()
  })

  it('check setupXRCamera', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    world.localClientEntity = entity
    Engine.instance.currentWorld.camera = new PerspectiveCamera()

    setupXRInputSourceComponent(entity)
    setupXRCameraForLocalEntity(entity)

    assert(Engine.instance.currentWorld.camera.parent)
  })

  it('check setupXRInputSourceComponent', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const inputSource = setupXRInputSourceComponent(entity)
    assert(inputSource)
    assert(hasComponent(entity, XRInputSourceComponent))
  })

  it('check endXR', async () => {
    createMockNetwork()

    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    world.localClientEntity = entity

    const xrManagerMock = { setSession() {} } as any
    EngineRenderer.instance.xrSession = true as any
    EngineRenderer.instance.xrManager = xrManagerMock
    Engine.instance.currentWorld.camera = new PerspectiveCamera()
    sinon.spy(xrManagerMock, 'setSession')

    setupXRInputSourceComponent(entity)
    addComponent(entity, XRHandsInputComponent, { hands: [] })
    addComponent(entity, NetworkObjectComponent, { ownerId: Engine.instance.userId, networkId: 42 })

    const hyperfluxStub = {} as any
    const { endXR } = proxyquire('./WebXRFunctions', {
      '@xrengine/hyperflux': hyperfluxStub
    })

    sinon.spy(hyperfluxStub, 'dispatchAction')

    endXR()

    assert(xrManagerMock.setSession.calledOnce)
    const setSessionCallArg = xrManagerMock.setSession.getCall(0).args[0]
    assert(setSessionCallArg === null)
    assert(Engine.instance.currentWorld.camera.parent === Engine.instance.currentWorld.scene)
    assert(!hasComponent(entity, XRInputSourceComponent))
    assert(!hasComponent(entity, XRHandsInputComponent))

    assert(hyperfluxStub.dispatchAction.calledOnce)
    const dispatchActionCallArg = hyperfluxStub.dispatchAction.getCall(0).args[0]
    assert(dispatchActionCallArg.type === WorldNetworkAction.setXRMode.type)
    assert(dispatchActionCallArg.enabled === false)
    assert(dispatchActionCallArg.avatarInputControllerType === '')
  })
})
