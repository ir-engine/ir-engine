import assert, { strictEqual } from 'assert'

import { moveAvatar } from '../../../src/avatar/functions/moveAvatar'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { createWorld } from '../../../src/ecs/classes/World'
import { addComponent, getComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { AvatarComponent } from '../../../src/avatar/components/AvatarComponent'
import { VelocityComponent } from '../../../src/physics/components/VelocityComponent'
import { AvatarControllerComponent } from '../../../src/avatar/components/AvatarControllerComponent'
import { Group, PerspectiveCamera, Vector3 } from 'three'
import { DEFAULT_AVATAR_ID } from '@xrengine/common/src/constants/AvatarConstants'
import { VectorSpringSimulator } from '../../../src/physics/classes/springs/VectorSpringSimulator'
import { CollisionGroups } from '../../../src/physics/enums/CollisionGroups'
import { Engine } from '../../../src/ecs/classes/Engine'


// all components depended on by the moveAvatar function
const createMovingAvatar = (world) => {

  const entity = createEntity(world)

  addComponent(entity, VelocityComponent, {
    velocity: new Vector3()
  })

  const modelContainer = new Group()
  modelContainer.name = 'Actor (modelContainer)' + entity

  addComponent(entity, AvatarComponent, {
    avatarId: DEFAULT_AVATAR_ID,
    avatarHalfHeight: 10,
    avatarHeight: 20,
    modelContainer,
    isGrounded: false
  }, world)
  
  const controller = world.physics.createController({
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
  }, world) as PhysX.PxCapsuleController

  const velocitySimulator = new VectorSpringSimulator(60, 50, 0.8)
  addComponent(entity, AvatarControllerComponent, {
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
    velocitySimulator
  }, world)

  return entity
}

describe('moveAvatar function tests', async () => {
  
	let world

	beforeEach(async () => {
    /* hoist */
		world = createWorld()
		Engine.currentWorld = world
    // instantiate physics scene (depended on by world.physics.createMaterial())
    await world.physics.createScene()
	})

  it('should apply world.fixedDelta @ 60 tick to avatar movement, consistent with physics simulation', async () => {
    /* mock */
    world.physics.timeScale = 1
    world.fixedDelta = 1000 / 60

    const entity = createMovingAvatar(world)
    
    const camera = new PerspectiveCamera(60, 800/600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)
    
    // velocity starts at 0
    strictEqual(velocity.velocity.x, 0)
    strictEqual(velocity.velocity.z, 0)

    /* run */
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    strictEqual(velocity.velocity.x, 1)
    strictEqual(velocity.velocity.z, 1)
  })

  it('should apply world.fixedDelta @ 120 tick to avatar movement, consistent with physics simulation', async () => {
    /* mock */
    world.physics.timeScale = 1
    world.fixedDelta = 1000 / 120

    const entity = createMovingAvatar(world)
    
    const camera = new PerspectiveCamera(60, 800/600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)
    
    // velocity starts at 0
    strictEqual(velocity.velocity.x, 0)
    strictEqual(velocity.velocity.z, 0)

    /* run */
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    strictEqual(velocity.velocity.x, 1)
    strictEqual(velocity.velocity.z, 1)
  })

  it('should take world.physics.timeScale into account when moving avatars, consistent with physics simulation', async () => {
    /* mock */
    world.physics.timeScale = 1 / 2
    world.fixedDelta = 1000 / 60

    const entity = createMovingAvatar(world)
    
    const camera = new PerspectiveCamera(60, 800/600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)
    
    // velocity starts at 0
    strictEqual(velocity.velocity.x, 0)
    strictEqual(velocity.velocity.z, 0)

    /* run */
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    strictEqual(velocity.velocity.x, 1)
    strictEqual(velocity.velocity.z, 1)
  })

  it('should not allow velocity to breach a full unit through multiple frames', () => {
    /* mock */
    world.physics.timeScale = 1
    world.fixedDelta = 1000 / 60

    const entity = createMovingAvatar(world)
    
    const camera = new PerspectiveCamera(60, 800/600, 0.1, 10000)

    const velocity = getComponent(entity, VelocityComponent)
    
    // velocity starts at 0
    strictEqual(velocity.velocity.x, 0)
    strictEqual(velocity.velocity.z, 0)

    /* run */
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)
    moveAvatar(world, entity, camera)

    /* assert */

    // velocity should increase on horizontal plane
    assert(velocity.velocity.x <= 1)
    assert(velocity.velocity.z <= 1)
  })
})
