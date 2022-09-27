import assert from 'assert'
import Sinon from 'sinon'
import { Mesh } from 'three'

import { createEngine, setupEngineActionSystems } from '@xrengine/engine/src/initializeEngine'

import { AssetClass } from '../enum/AssetClass'
import { AssetType } from '../enum/AssetType'
import { AssetLoader } from './AssetLoader'

/**
 * tests
 */
describe('AssetLoader', async () => {
  beforeEach(async () => {
    createEngine()
    setupEngineActionSystems()
  })

  describe('processModelAsset', () => {
    it('should work for gltf asset', async () => {
      const asset = new Mesh()
      assert.doesNotThrow(() => AssetLoader.processModelAsset(asset, {}))
    })
  })

  describe('getAssetType', () => {
    it('should work for gltf asset', async () => {
      const url = 'www.test.com/file.gltf'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetType.glTF)
    })

    it('should work for fbx asset', async () => {
      const url = 'www.test.com/file.fbx'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetType.FBX)
    })

    it('should work for vrm asset', async () => {
      const url = 'www.test.com/file.vrm'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetType.VRM)
    })

    it('should work for png asset', async () => {
      const url = 'www.test.com/file.png'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetType.PNG)
    })

    it('should work for jpeg asset', async () => {
      const url = 'www.test.com/file.jpeg'
      const type = AssetLoader.getAssetType(url)
      assert.equal(type, AssetType.JPEG)
    })
  })

  describe('getAssetClass', () => {
    it('should work for model asset', async () => {
      const url = 'www.test.com/file.gltf'
      const type = AssetLoader.getAssetClass(url)
      assert.equal(type, AssetClass.Model)
    })

    it('should work for image asset', async () => {
      const url = 'www.test.com/file.png'
      const type = AssetLoader.getAssetClass(url)
      assert.equal(type, AssetClass.Image)
    })

    it('should work for unsupported asset', async () => {
      const url = 'www.test.com/file.pdf'
      const type = AssetLoader.getAssetClass(url)
      assert.equal(type, AssetClass.Unknown)
    })
  })

  describe('AssetLoader.load', () => {
    let sandbox

    beforeEach(() => {
      sandbox = Sinon.createSandbox()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should give error for empty url', async () => {
      AssetLoader.load('', {}, undefined, undefined, (err) => {
        assert.notEqual(err, null)
      })
    })
  })
})
