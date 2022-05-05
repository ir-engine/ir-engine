import assert from 'assert'
import { Mesh, MeshStandardMaterial, Texture } from 'three'

// import { loadGLTFAssetNode } from '../../../tests/util/loadGLTFAssetNode'

describe('lightmap integration support', async () => {
  describe('load lightmaps', () => {
    // todo: we basically need to polyfill the whole browser api to make this work
    // it.skip('should load lightmapped gltf', async () => {
    //   const gltf = await loadGLTFAssetNode('/packages/engine/tests/assets/lightmaptest.glb')
    //   const asset = gltf.scene.children.find(obj => obj.name === 'hall')! as Mesh
    //   assert((asset.material as MeshStandardMaterial).lightMap)
    // })
  })
})
