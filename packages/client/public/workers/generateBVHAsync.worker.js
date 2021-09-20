// TODO: Current version of web-worker does not support importScripts on server side
// Related PR: https://github.com/developit/web-worker/pull/9

importScripts('/workers/three.min.js')
importScripts('/workers/three-mesh-bvh.umd.cjs.js')

onmessage = function ({ data }) {
  const { index, position, options } = data

  try {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3, false))
    geometry.setIndex(new THREE.BufferAttribute(index, 1, false))
    options.lazyGeneration = false
    const bvh = new MeshBVHLib.MeshBVH(geometry, options)
    const serialized = MeshBVHLib.MeshBVH.serialize(bvh, { copyIndexBuffer: false })
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
}
