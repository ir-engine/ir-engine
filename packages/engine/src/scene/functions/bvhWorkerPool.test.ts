import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { assert, describe, it } from 'vitest'
import { bvhWorkerPool, generateMeshBVH } from './bvhWorkerPool'

describe('bvhWorkerPool', () => {
  it('should create a worker pool', () => {
    assert.ok(bvhWorkerPool)
    assert.equal(bvhWorkerPool.limit, 1)

    // @ts-ignore - private method
    assert.equal(typeof bvhWorkerPool.workerCreator, 'function')
  })

  it('should generateMeshBVH', async () => {
    const bvh = await generateMeshBVH(
      new Mesh(new BoxGeometry(), new MeshBasicMaterial()),
      new AbortController().signal
    )
    assert.ok(bvh instanceof MeshBVH)
  })
})
