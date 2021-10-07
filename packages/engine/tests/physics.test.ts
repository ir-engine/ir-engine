import { initializeEngine } from '../src/initializeEngine'
import { engineTestSetup } from './util/setupEngine'
import { useWorld } from "../src/ecs/functions/SystemHooks"
import { putIntoPhysXHeap, vectorToArray } from "../src/physics/functions/physxHelpers"
import assert from 'assert'

describe('Physics', () => {

  after(() => setTimeout(() => process.exit(0), 500))

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

  it.skip('Can load physics convex mesh', async () => {
    await initializeEngine(engineTestSetup)
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
    await initializeEngine(engineTestSetup)
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

})
