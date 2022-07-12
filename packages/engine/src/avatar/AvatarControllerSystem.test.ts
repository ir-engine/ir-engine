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
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import {
  avatarControllerExit,
  rotateTowardsDisplacementVector,
  updateAvatarTransformPosition,
  updateColliderPose
} from './AvatarControllerSystem'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'

describe('AvatarControllerSystem', async () => {
  beforeEach(async () => {
    createEngine()
  })

  it('check avatarControllerExit', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const physics = { removeController: () => {} } as any
    const worldMock = { physics } as any
    const controller = { controller: {} } as any
    const avatar = { isGrounded: true } as any

    ;(AvatarControllerComponent as any)._setPrevious(entity, controller)
    addComponent(entity, AvatarComponent, avatar)

    sinon.spy(physics, 'removeController')

    avatarControllerExit(entity, worldMock)
    assert(physics.removeController.calledOnce)
    const removeControllerCallArg = physics.removeController.getCall(0).args[0]
    assert(removeControllerCallArg === controller.controller)
    assert(avatar.isGrounded === false)
  })

  it('check updateColliderPose', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const colliderBody = { setGlobalPose: () => {} } as any
    const collider = { body: colliderBody } as any
    const controllerPos = new Vector3(1, 2, 3)
    const controller = {
      controller: {
        getPosition: () => controllerPos
      }
    } as any

    const position = createVector3Proxy(TransformComponent.position, entity)
    const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
    const scale = createVector3Proxy(TransformComponent.scale, entity)
    const transform = { position, rotation, scale }

    addComponent(entity, ColliderComponent, collider)
    addComponent(entity, AvatarControllerComponent, controller)
    addComponent(entity, TransformComponent, transform)

    sinon.spy(colliderBody, 'setGlobalPose')

    updateColliderPose(entity)
    assert(colliderBody.setGlobalPose.calledOnce)
    const setGlobalPoseArgs = colliderBody.setGlobalPose.getCall(0).args
    assert(setGlobalPoseArgs[0].translation === controllerPos)
    assert(setGlobalPoseArgs[0].rotation === transform.rotation)
  })

  it('check updateAvatarTransformPosition', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const controllerPos = new Vector3(1, 2, 3)
    const controller = {
      controller: {
        getPosition: () => controllerPos
      }
    } as any

    const position = createVector3Proxy(TransformComponent.position, entity)
    const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
    const scale = createVector3Proxy(TransformComponent.scale, entity)
    const transform = { position, rotation, scale }

    const avatar = {
      avatarHalfHeight: 1
    } as any

    addComponent(entity, AvatarControllerComponent, controller)
    addComponent(entity, TransformComponent, transform)
    addComponent(entity, AvatarComponent, avatar)

    updateAvatarTransformPosition(entity)

    assert(transform.position.x === 1)
    assert(transform.position.y === 1)
    assert(transform.position.z === 3)
  })

  it('check rotateTowardsDisplacementVector', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const position = createVector3Proxy(TransformComponent.position, entity)
    const rotation = createQuaternionProxy(TransformComponent.rotation, entity)
    const scale = createVector3Proxy(TransformComponent.scale, entity)
    const transform = { position, rotation, scale }

    const testRotation = new Quaternion().copy(transform.rotation)

    addComponent(entity, TransformComponent, transform)

    const displace = new Vector3(1, 3, 1)
    const displaceXZ = new Vector3(displace.x, 0, displace.z)
    displaceXZ.applyQuaternion(new Quaternion().copy(testRotation).invert())
    const rotMatrix = new Matrix4().lookAt(displaceXZ, V_000, V_010)
    const targetOrientation = new Quaternion().setFromRotationMatrix(rotMatrix)
    testRotation.slerp(targetOrientation, Math.max(world.deltaSeconds * 2, 3 / 60))

    rotateTowardsDisplacementVector(entity, displace, world)

    assert(quatNearEqual(testRotation, transform.rotation))
  })
})
