import { initializeEngine } from '../src/initializeEngine'
import { engineTestSetup } from './util/setupEngine'
import { useWorld } from "../src/ecs/functions/SystemHooks"
import { putIntoPhysXHeap, vectorToArray } from "../src/physics/functions/physxHelpers"
import assert from 'assert'
import { createShape } from '../src/physics/functions/createCollider'
import { createEntity } from '../src/ecs/functions/EntityFunctions'
import { BodyType } from '../src/physics/types/PhysicsTypes'
import { CollisionGroups } from '../src/physics/enums/CollisionGroups'
import { Quaternion, Vector3 } from 'three'
import { delay } from '../src/common/functions/delay'
import { CollisionComponent } from '../src/physics/components/CollisionComponent'
import { addComponent } from '../src/ecs/functions/ComponentFunctions'
import { Engine } from '../src/ecs/classes/Engine'
import { createWorld } from '../src/ecs/classes/World'
import { loadPhysX } from '../src/physics/physx/loadPhysX'
import PhysicsSystem from '../src/physics/systems/PhysicsSystem'
import { SystemUpdateType } from '../src/ecs/functions/SystemUpdateType'


const avatarRadius = 0.25
const avatarHeight = 1.8
const capsuleHeight = avatarHeight - avatarRadius * 2
const avatarHalfHeight = avatarHeight / 2
const mockDelta = 1/60
let mockElapsedTime = 0

describe('Physics', () => {

  beforeEach(async () => {
    Engine.currentWorld = createWorld()
    Engine.defaultWorld = Engine.currentWorld
    await Engine.currentWorld.physics.createScene({ verbose: true })
  })

  afterEach(() => {
    Engine.currentWorld = null!
    Engine.defaultWorld = null!
    delete (globalThis as any).PhysX
  })

  // face indexed cube data
  const vertices = [
    0, 0, 1,
    1, 0, 1,
    0, 1, 1,
    1, 1, 1,
    0, 0, 0,
    1, 0, 0,
    0, 1, 0,
    1, 1, 0,
  ]
  const indices = [
    0, 1, 2,
    1, 3, 2,
    2, 3, 7,
    2, 7, 6,
    1, 7, 3,
    1, 5, 7,
    6, 7, 4,
    7, 5, 4,
    0, 4, 1,
    1, 4, 5,
    2, 6, 4,
    0, 2, 4
  ]

  // this has problems with the PhysX bindings itself
  it.skip('Can load physics convex mesh', async () => {
    const world = useWorld()

    const verticesPtr = putIntoPhysXHeap(PhysX.HEAPF32, vertices)

    const trimesh = world.physics.cooking.createConvexMesh(
      verticesPtr,
      vertices.length,
      world.physics.physics
    )

    PhysX._free(verticesPtr)

    const newVertices = vectorToArray(trimesh.getVertices())
    assert.equal(newVertices, vertices)
  })


  it('Can load physics trimesh', async () => {
    const world = useWorld()

    const verticesPtr = putIntoPhysXHeap(PhysX.HEAPF32, vertices)
    const indicesPtr = putIntoPhysXHeap(PhysX.HEAPF32, indices)

    const trimesh = world.physics.cooking.createTriMesh(
      verticesPtr,
      vertices.length,
      indicesPtr,
      indices.length / 3,
      false,
      world.physics.physics
    )
    PhysX._free(verticesPtr)
    PhysX._free(indicesPtr)

    const newVertices = vectorToArray(trimesh.getVertices())
    const newIndices = vectorToArray(trimesh.getTriangles())

    // for (let i = 0; i < indices.length; i += 3) {
    //   console.log(
    //     'new', newIndices[i], newIndices[i + 1], newIndices[i + 2],
    //     '\n',
    //     'expected', indices[i], indices[i + 1], indices[i + 2]
    //   )
    // }
    assert.deepEqual(newVertices, vertices)
    assert.equal(newIndices.length, indices.length)
  })

  /**
   * this is a hacky quick fix - split PhysicsSystem into lots of little functions and replace this with proper unit tests
   */
  it('Can detect dynamic and trigger collision', async () => {
    const world = useWorld()
    const runPhysics = await PhysicsSystem(world, null!)

    const execute = () => {
      world.fixedTick += 1
      world.elapsedTime += mockDelta 
      runPhysics()
    }

    // const controllerEntity = createEntity()
    // const controller = world.physics.createController({
    //   isCapsule: true,
    //   material: world.physics.createMaterial(),
    //   position: {
    //     x: 0,
    //     y: avatarHalfHeight,
    //     z: 0
    //   },
    //   contactOffset: 0.01,
    //   stepOffset: 0.25,
    //   slopeLimit: 0,
    //   height: capsuleHeight,
    //   radius: avatarRadius,
    //   userData: {
    //     entity: controllerEntity
    //   }
    // }) as PhysX.PxCapsuleController

    const avatarEntity = createEntity()
    addComponent(avatarEntity, CollisionComponent, { collisions: [] })
    const avatarShape = world.physics.createShape(
      new PhysX.PxCapsuleGeometry(avatarRadius, capsuleHeight / 2),
      world.physics.physics.createMaterial(0, 0, 0),
      {
        collisionLayer: CollisionGroups.Avatars,
        collisionMask: CollisionGroups.Trigger
      }
    )
    const avatarBody = world.physics.addBody({
      shapes: [avatarShape],
      type: BodyType.DYNAMIC,
      transform: {
        translation: new Vector3(2, 0, 0),
        rotation: new Quaternion()
      },
      userData: {
        entity: avatarEntity
      }
    })

    const triggerEntity = createEntity()
    const collisions = addComponent(triggerEntity, CollisionComponent, { collisions: [] })

    const triggerShape = world.physics.createShape(
      new PhysX.PxCapsuleGeometry(avatarRadius, capsuleHeight / 2),
      world.physics.physics.createMaterial(0, 0, 0),
      {
        isTrigger: true,
        collisionLayer: CollisionGroups.Trigger,
        collisionMask: CollisionGroups.Avatars
      }
    )
    const triggerBody = world.physics.addBody({
      shapes: [triggerShape],
      type: BodyType.STATIC,
      transform: {
        translation: new Vector3(),
        rotation: new Quaternion()
      },
      userData: {
        entity: triggerEntity
      }
    })

    execute()

    avatarBody.setGlobalPose({
      translation: new Vector3(),
      rotation: new Quaternion()
    }, true)

    // update simulation
    execute()

    // collect collisions
    execute()

    assert.equal(collisions.collisions.length, 1)

  })

})
