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
import { AssetExt, AssetType, FileToAssetExt, FileToAssetType } from './AssetType'

describe('AssetType', () => {
  beforeEach(async () => {})

  afterEach(() => {})

  it('Returns the correct extension enum for urls', () => {
    // Test both extensions for jpg
    const jpg = 'https://localhost:3000/test.jpg?test=123212'
    const jpeg = 'https://localhost:3000/test.jpeg?test=123123'
    const badURl = 'https://localhost:3000/test.'
    const badURl2 = '/path/path/'

    assert(FileToAssetExt(jpg) === AssetExt.JPEG)
    assert(FileToAssetExt(jpeg) === AssetExt.JPEG)
    assert(!FileToAssetExt(badURl))

    const exts = Object.values(AssetExt)

    const badExt = FileToAssetExt(badURl2)
    for (const ext of exts) {
      assert(badExt !== <AssetExt>ext)
    }

    for (const ext of exts) {
      const url = 'https://localhost:3000/test.' + ext
      assert(FileToAssetExt(url) === <AssetExt>ext)
    }

    for (const ext of exts) {
      const url = 'https://localhost:3000/test.' + ext.toUpperCase()
      assert(FileToAssetExt(url) === <AssetExt>ext)
    }

    for (const ext of exts) {
      const url = 'localhost:3000/test.' + ext
      assert(FileToAssetExt(url) === <AssetExt>ext)
    }
  })

  it('Returns the correct type enum for urls', () => {
    const jpg = 'https://localhost:3000/test.jpg?test=123212'
    const jpeg = 'https://localhost:3000/test.jpeg?test=123123'
    const gltf = 'https://localhost:3000/test.gltf?test=123123'
    const gltfMaterial = 'https://localhost:3000/test.material.gltf?test=123123'
    const gltfLookdev = 'https://localhost:3000/test.lookdev.gltf?test=123123'
    const gltfPrefab = 'https://localhost:3000/test.prefab.gltf?test=123123'
    const video = 'https://localhost:3000/test.mp4?test=123123'
    const audio = 'https://localhost:3000/test.mp3?test=123123'
    const uvol = 'https://localhost:3000/test.uvol?test=123123'

    assert(FileToAssetType(jpg) === AssetType.Image)
    assert(FileToAssetType(jpeg) === AssetType.Image)
    assert(FileToAssetType(gltf) === AssetType.Model)
    assert(FileToAssetType(gltfMaterial) === AssetType.Material)
    assert(FileToAssetType(gltfLookdev) === AssetType.Lookdev)
    assert(FileToAssetType(gltfPrefab) === AssetType.Prefab)
    assert(FileToAssetType(video) === AssetType.Video)
    assert(FileToAssetType(audio) === AssetType.Audio)
    assert(FileToAssetType(uvol) === AssetType.Volumetric)
  })
})
