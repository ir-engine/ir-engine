import assert, { strictEqual } from 'assert'
import { Group, PerspectiveCamera, Vector3 } from 'three'

import { AvatarComponent } from '../../../src/avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../../src/avatar/components/AvatarControllerComponent'
import { moveAvatar } from '../../../src/avatar/functions/moveAvatar'
import { Engine } from '../../../src/ecs/classes/Engine'
import { createWorld } from '../../../src/ecs/classes/World'
import { addComponent, getComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { VectorSpringSimulator } from '../../../src/physics/classes/springs/VectorSpringSimulator'
import { VelocityComponent } from '../../../src/physics/components/VelocityComponent'
import { CollisionGroups } from '../../../src/physics/enums/CollisionGroups'
import { Object3DComponent } from '../../../src/scene/components/Object3DComponent'

// all components depended on by the moveAvatar function
const createMovingAvatar = (world) => {
  const entity = createEntity(world)

  addComponent(entity, VelocityComponent, {
    linear: new Vector3(),
    angular: new Vector3()
  })

  const tiltContainer = new Group()
  tiltContainer.name = 'Actor (tiltContainer)' + entity

  const modelContainer = new Group()
  modelContainer.name = 'Actor (modelContainer)' + entity

  tiltContainer.add(modelContainer)

  addComponent(
    entity,
    AvatarComponent,
    {
      avatarHalfHeight: 10,
      avatarHeight: 20,
      modelContainer,
      isGrounded: false
    },
    world
  )

  addComponent(entity, Object3DComponent, { value: tiltContainer })

  const controller = world.physics.createController(
    {
      isCapsule: true,
      material: world.physics.createMaterial(),
      position: {
        x: 0,
        y: 0 + 10,
        z: 0
      },
      contactOffset: 0.01,
      stepOffset: 0.25,
      slopeLimit: 0,
      height: 10,
      radius: 5,
      userData: {
        entity
      }
    },
    world
  ) as PhysX.PxCapsuleController

  const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
  addComponent(
    entity,
    AvatarControllerComponent,
    {
      controller,
      filterData: new PhysX.PxFilterData(
        CollisionGroups.Avatars,
        CollisionGroups.Default | CollisionGroups.Ground | CollisionGroups.Trigger,
        0,
        0
      ),
      collisions: [false, false, false],
      movementEnabled: true,
      isJumping: false,
      isWalking: false,
      // set input to move in a straight line on X/Z axis / horizontal diagonal
      localMovementDirection: new Vector3(1, 0, 1),
      velocitySimulator,
      currentSpeed: 0,
      speedVelocity: { value: 0 }
    },
    world
  )

  return entity
}

describe('moveAvatar function tests', () => {
  let world

  beforeEach(async () => {
    /* hoist */
    world = createWorld()
    Engine.currentWorld = world
    // instantiate physics scene (depended on by world.physics.createMaterial())
    await world.physics.createScene()
  })

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', () => {
    /* mock */
    world.physics.timeScale = 1
    world.fixedDelta = 1000 / 60

    const entity = createMovingAvatar(world)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    strictEqual(velocity.linear.x, 1)
    strictEqual(velocity.linear.z, 1)
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', () => {
    /* mock */
    world.physics.timeScale = 1
    world.fixedDelta = 1000 / 120

    const entity = createMovingAvatar(world)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    strictEqual(velocity.linear.x, 1)
    strictEqual(velocity.linear.z, 1)
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', () => {
    /* mock */
    world.physics.timeScale = 1 / 2
    world.fixedDelta = 1000 / 60

    const entity = createMovingAvatar(world)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    strictEqual(velocity.linear.x, 1)
    strictEqual(velocity.linear.z, 1)
  })

  it('should not allow velocity to breach a full unit through multiple frames', () => {
    /* mock */
    world.physics.timeScale = 1
    world.fixedDelta = 1000 / 60

    const entity = createMovingAvatar(world)

    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)

    // velocity starts at 0
    strictEqual(velocity.linear.x, 0)
    strictEqual(velocity.linear.z, 0)

    /* run */
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    assert(velocity.linear.x <= 1)
    assert(velocity.linear.z <= 1)
  })
})
