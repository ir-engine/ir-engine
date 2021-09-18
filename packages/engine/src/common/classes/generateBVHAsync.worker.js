// TODO: Avoid code duplication: There is a copy of this script in /public
import * as THREE from 'three'
import { MeshBVH } from 'three-mesh-bvh'

addEventListener('message', ({ data }) => {
  const { index, position, options } = data

  try {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3, false))
    if (index) {
      geometry.setIndex(new THREE.BufferAttribute(index, 1, false))
    }
    options.lazyGeneration = false
    const bvh = new MeshBVH(geometry, options)
    const serialized = MeshBVH.serialize(bvh, { copyIndexBuffer: false })
    postMessage(
      {
        error: null,
        serialized,
        position
      },
      [serialized.index.buffer, position.buffer]
    )
  } catch (error) {
    postMessage({
      error,
      serialized: null
    })
  }
})
