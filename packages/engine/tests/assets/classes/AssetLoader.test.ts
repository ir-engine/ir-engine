import assert from 'assert'
import Sinon from 'sinon'
// import rewire from 'rewire'
import { AssetLoader, getAssetClass, getAssetType, processModelAsset } from '../../../src/assets/classes/AssetLoader'
import { AssetClass } from '../../../src/assets/enum/AssetClass'
import { AssetType } from '../../../src/assets/enum/AssetType'

/**
 * tests
 */
describe('AssetLoader', () => {
  describe('processModelAsset', () => {
    it('should work for gltf asset', async () => {
      const asset = {
        traverse: Sinon.spy(),
        children: []
      }
      const params = {
        url: '',
        castShadow: true,
        receiveShadow: true
      }

      assert.doesNotThrow(() => processModelAsset(asset, params))
    })
  })

  describe('getAssetType', () => {
    it('should work for gltf asset', async () => {
      const url = 'www.test.com/file.gltf'
      const type = getAssetType(url)
      assert.equal(type, AssetType.glTF)
    })

    it('should work for fbx asset', async () => {
      const url = 'www.test.com/file.fbx'
      const type = getAssetType(url)
      assert.equal(type, AssetType.FBX)
    })

    it('should work for vrm asset', async () => {
      const url = 'www.test.com/file.vrm'
      const type = getAssetType(url)
      assert.equal(type, AssetType.VRM)
    })

    it('should work for png asset', async () => {
      const url = 'www.test.com/file.png'
      const type = getAssetType(url)
      assert.equal(type, AssetType.PNG)
    })

    it('should work for jpeg asset', async () => {
      const url = 'www.test.com/file.jpeg'
      const type = getAssetType(url)
      assert.equal(type, AssetType.JPEG)
    })
  })

  describe('getAssetClass', () => {
    it('should work for model asset', async () => {
      const url = 'www.test.com/file.gltf'
      const type = getAssetClass(url)
      assert.equal(type, AssetClass.Model)
    })

    it('should work for image asset', async () => {
      const url = 'www.test.com/file.png'
      const type = getAssetClass(url)
      assert.equal(type, AssetClass.Image)
    })

    it('should work for unsupported asset', async () => {
      const url = 'www.test.com/file.pdf'
      const type = getAssetClass(url)
      assert.equal(type, null)
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
      const params = {
        url: '',
        castShadow: true,
        receiveShadow: true
      }

      AssetLoader.load(params, undefined, undefined, (err) => {
        assert.notEqual(err, null)
      })
    })

    it('should work for cached asset', async () => {
      // Mock
      const assetContent = 'I am an asset'
      sandbox.stub(AssetLoader.Cache, 'has').returns(true)
      sandbox.stub(AssetLoader.Cache, 'get').returns(assetContent)

      const params = {
        url: 'www.test.com/file.gltf',
        castShadow: true,
        receiveShadow: true
      }

      // Run & Assert
      AssetLoader.load(params, (res) => {
        assert.equal(res, assetContent)
      })
    })

    // it('should work for non cached asset', async () => {
    //     // Mock
    //     const assetLoaded = "I am an loaded";
    //     sandbox.stub(AssetLoader.Cache, "has").returns(false);
    //     const assetLoader = rewire('../../../src/assets/classes/AssetLoader')
    //     assetLoader.__set__({
    //         'getLoader': {
    //             load: function (
    //                 params,
    //                 onLoad = (response) => { },
    //                 onProgress = (request) => { },
    //                 onError = (event) => { },
    //                 isInstanced = false
    //             ) {
    //                 onLoad(assetLoaded);
    //              }
    //         }
    //     });

    //     const params = {
    //         url: "www.test.com/file.gltf",
    //         castShadow: true,
    //         receiveShadow: true
    //     };

    //     // Run & Assert
    //     AssetLoader.load(params, (res) => {
    //         assert.equal(res, assetLoaded)
    //     });
    // })
  })
})
