import { initializeEngine } from '../src/initializeEngine'
import { engineTestSetup } from './util/setupEngine'
import { useWorld } from "../src/ecs/functions/SystemHooks"
import { putIntoPhysXHeap, vectorToArray } from "../src/physics/functions/physxHelpers"

describe('Physics', () => {

  afterAll(() => setTimeout(() => process.exit(0), 1000))

  
  test('Can load physics trimesh', async () => {
    await initializeEngine(engineTestSetup)
    const world = useWorld()

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

    const verticesPtr = putIntoPhysXHeap(PhysX.HEAPF32, vertices)
    const indicesPtr = putIntoPhysXHeap(PhysX.HEAPF32, indices)

    const trimesh = world.physics.cooking.createTriMesh(
      verticesPtr,
      vertices.length,
      indicesPtr,
      indices.length,
      false,
      world.physics.physics
    )
    PhysX._free(verticesPtr)
    PhysX._free(indicesPtr)

    const newVertices = vectorToArray(trimesh.getVertices())
    const newIndices = vectorToArray(trimesh.getTriangles())

    for(let i = 0; i < indices.length; i++) {
      console.log(newIndices[i], indices[i])
    }
    expect(newVertices).toEqual(vertices)
    expect(newIndices).toEqual(indices)
  })

})