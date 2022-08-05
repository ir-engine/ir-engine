import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { PerspectiveCamera } from 'three'

import { createMockNetwork } from '../../tests/util/createMockNetwork'
import { createAvatar } from '../avatar/functions/createAvatar'
import { Engine } from '../ecs/classes/Engine'
import { hasComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { createEngine } from '../initializeEngine'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../networking/functions/WorldNetworkActionReceptor'
import { Physics } from '../physics/classes/Physics'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { XRHandsInputComponent, XRInputSourceComponent } from './XRComponents'
import { setupXRInputSourceComponent } from './XRFunctions'

describe('WebXRFunctions Unit', async () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
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

    const action = WorldNetworkAction.spawnAvatar({})
    WorldNetworkActionReceptor.receiveSpawnObject(action)
    createAvatar(action)

    const entity = world.localClientEntity

    const xrManagerMock = { setSession() {} } as any
    EngineRenderer.instance.xrSession = true as any
    EngineRenderer.instance.xrManager = xrManagerMock
    Engine.instance.currentWorld.camera = new PerspectiveCamera()
    sinon.spy(xrManagerMock, 'setSession')

    setupXRInputSourceComponent(entity)

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
