import assert from 'assert'
import sinon from 'sinon'
import { Matrix4, Quaternion, Vector3 } from 'three'

import { V_000, V_010 } from '../common/constants/MathConstants'
import { quatNearEqual } from '../common/functions/QuaternionUtils'
import { createQuaternionProxy, createVector3Proxy } from '../common/proxies/three'
import { Engine } from '../ecs/classes/Engine'
import { addComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { createEngine } from '../initializeEngine'
import { Physics } from '../physics/classes/Physics'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { removeAvatarControllerRigidBody, rotateBodyTowardsVector } from './AvatarControllerSystem'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'

describe('AvatarControllerSystem', async () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  it('check avatarControllerExit', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const physicsWorld = { removeRigidBody: () => {} } as any
    const worldMock = { physicsWorld } as any
    const controller = { controller: {} } as any

    ;(AvatarControllerComponent as any)._setPrevious(entity, controller)

    sinon.spy(physicsWorld, 'removeRigidBody')

    removeAvatarControllerRigidBody(entity, worldMock)
    assert(physicsWorld.removeRigidBody.calledOnce)
    const removeRigidBodyCallArg = physicsWorld.removeRigidBody.getCall(0).args[0]
    assert(removeRigidBodyCallArg === controller.controller)
  })

  it('check rotateTowardsDisplacementVector', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const transform = setTransformComponent(entity)

    const testRotation = new Quaternion().copy(transform.rotation)

    addComponent(entity, TransformComponent, transform)

    const displace = new Vector3(1, 3, 1)
    const displaceXZ = new Vector3(displace.x, 0, displace.z)
    displaceXZ.applyQuaternion(new Quaternion().copy(testRotation).invert())
    const rotMatrix = new Matrix4().lookAt(displaceXZ, V_000, V_010)
    const targetOrientation = new Quaternion().setFromRotationMatrix(rotMatrix)
    testRotation.slerp(targetOrientation, Math.max(world.deltaSeconds * 2, 3 / 60))

    rotateBodyTowardsVector(entity, displace)

    assert(quatNearEqual(testRotation, transform.rotation))
  })
})
