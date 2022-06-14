import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { PerspectiveCamera } from 'three'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { FollowCameraComponent, FollowCameraDefaultValues } from '../../camera/components/FollowCameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { XRInputSourceComponent } from '../components/XRInputSourceComponent'
import { setupXRCamera, setupXRInputSourceComponent } from './WebXRFunctions'

describe('WebXRFunctions Unit', async () => {
  beforeEach(async () => {
    createEngine()
  })

  it('check setupXRCamera', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    addComponent(entity, FollowCameraComponent, FollowCameraDefaultValues)
    world.localClientEntity = entity
    Engine.instance.currentWorld.camera = new PerspectiveCamera()
    assert(!Engine.instance.currentWorld.camera.parent)

    setupXRCamera(world)

    assert(!hasComponent(entity, FollowCameraComponent))
    assert(Engine.instance.currentWorld.camera.parent)
  })

  it('check setupXRInputSourceComponent', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const inputSource = setupXRInputSourceComponent(entity)
    assert(inputSource)
    assert(hasComponent(entity, XRInputSourceComponent))
  })

  it('check dispatchXRMode', async () => {
    createMockNetwork()

    const hyperfluxStub = {} as any
    const { dispatchXRMode } = proxyquire('./WebXRFunctions', {
      '@xrengine/hyperflux': hyperfluxStub
    })

    sinon.spy(hyperfluxStub, 'dispatchAction')
    dispatchXRMode(true, 'test')
    assert(hyperfluxStub.dispatchAction.calledOnce)

    const callArg = hyperfluxStub.dispatchAction.getCall(0).args[0]
    assert(callArg.type === 'network.SET_XR_MODE')
    assert(callArg.enabled)
    assert(callArg.avatarInputControllerType === 'test')
  })

  it('check mapXRControllers', async () => {})
})
