/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'
import Sinon from 'sinon'
import { Mesh } from 'three'
// hack to make tests happy
import '../../EngineModule'

import { createEngine } from '@etherealengine/engine/src/initializeEngine'

import { destroyEngine } from '../../ecs/classes/Engine'
import { AssetClass } from '../enum/AssetClass'
import { AssetType } from '../enum/AssetType'
import { AssetLoader } from './AssetLoader'

/**
 * tests
 */
describe('AssetLoader', async () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
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
