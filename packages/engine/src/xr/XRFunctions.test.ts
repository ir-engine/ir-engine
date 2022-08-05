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
})
