import assert from 'assert'
import { Vector3 } from 'three'

import { FollowCameraComponent, FollowCameraDefaultValues } from '../camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../camera/components/TargetCameraRotationComponent'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { NumericalType } from '../common/types/NumericalTypes'
import { Engine } from '../ecs/classes/Engine'
import { addComponent, getComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { createEngine } from '../initializeEngine'
import { InputType } from '../input/enums/InputType'
import { VectorSpringSimulator } from '../physics/classes/springs/VectorSpringSimulator'
import {
  fixedCameraBehindAvatar,
  setTargetCameraRotation,
  switchShoulderSide,
  toggleRunning
} from './AvatarInputSchema'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'

describe('avatarInputSchema', () => {
  beforeEach(async () => {
    createEngine()
  })

  it('check fixedCameraBehindAvatar', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const follower = addComponent(world.cameraEntity, FollowCameraComponent, FollowCameraDefaultValues)
    const firstValue = follower.locked
    fixedCameraBehindAvatar(entity, 'Test', {
      type: InputType.ONEDIM,
      value: [1] as NumericalType,
      lifecycleState: LifecycleValue.Started
    })

    assert(firstValue === !follower.locked)
  })

  it('check switchShoulderSide', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const follower = addComponent(
      Engine.instance.currentWorld.cameraEntity,
      FollowCameraComponent,
      FollowCameraDefaultValues
    )
    const firstValue = follower.shoulderSide
    switchShoulderSide(entity, 'Test', {
      type: InputType.ONEDIM,
      value: [1] as NumericalType,
      lifecycleState: LifecycleValue.Started
    })

    assert(firstValue === !follower.shoulderSide)
  })

  it('check setTargetCameraRotation', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const phi = 5
    const theta = 4

    setTargetCameraRotation(entity, phi, theta)
    const tcr = getComponent(entity, TargetCameraRotationComponent)

    assert(tcr.phi === phi)
    assert(tcr.theta === theta)
  })

  it('check setTargetCameraRotation with having the component already', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const tcr = addComponent(entity, TargetCameraRotationComponent, {
      phi: 1,
      phiVelocity: { value: 0 },
      theta: 2,
      thetaVelocity: { value: 0 },
      time: 0.3
    })

    const phi = 5
    const theta = 4

    setTargetCameraRotation(entity, phi, theta)

    assert(tcr.phi === phi)
    assert(tcr.theta === theta)
  })

  it('check setWalking', async () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
    const c = addComponent(entity, AvatarControllerComponent, {
      cameraEntity: null!,
      bodyCollider: null!,
      currentSpeed: 0,
      speedVelocity: { value: 0 },
      movementEnabled: true,
      isJumping: false,
      isWalking: false,
      isInAir: false,
      localMovementDirection: new Vector3(),
      velocitySimulator,
      lastPosition: new Vector3()
    })

    const firstValue = c.isWalking

    toggleRunning(entity, 'Test', {
      type: InputType.ONEDIM,
      value: [1] as NumericalType,
      lifecycleState: LifecycleValue.Started
    })

    assert(firstValue === !c.isWalking)
  })
})
