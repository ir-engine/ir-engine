/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { CanvasTexture, ClampToEdgeWrapping, CompressedTexture, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'

import { TextureData, TextureHash, WebLayerManagerBase } from '../WebLayerManagerBase'
import { WebLayer3D } from './WebLayer3D'

export interface ThreeTextureData {
  canvasTexture?: CanvasTexture
  compressedTexture?: CompressedTexture
}
export class WebLayerManager extends WebLayerManagerBase {
  static initialize(renderer: THREE.WebGLRenderer, ktx2Loader) {
    WebLayerManager.instance = new WebLayerManager()
    WebLayerManager.instance.renderer = renderer
    WebLayerManager.instance.ktx2Loader = ktx2Loader
    WebLayerManager.instance.ktx2Encoder.setWorkerLimit(1)
  }

  static instance: WebLayerManager

  renderer!: THREE.WebGLRenderer
  textureEncoding = SRGBColorSpace
  // ktx2Loader: KTX2Loader // todo, currently the type exists in the engine package, which we cannot import here
  ktx2Loader: any

  texturesByHash = new Map<string, ThreeTextureData>()
  // texturesByCharacter = new Map<number, ThreeTextureData>()
  layersByElement = new WeakMap<Element, WebLayer3D>()
  layersByMesh = new WeakMap<THREE.Mesh, WebLayer3D>()

  getTexture(textureHash: TextureHash) {
    const textureData = this.getTextureState(textureHash)
    if (!this.texturesByHash.has(textureHash)) {
      this.texturesByHash.set(textureHash, {})
    }
    this._loadCompressedTextureIfNecessary(textureData)
    this._loadCanvasTextureIfNecessary(textureData)
    return this.texturesByHash.get(textureHash)!
  }

  _compressedTexturePromise = new Map<string, (value?: any) => void>()

  private _loadCompressedTextureIfNecessary(textureData: TextureData) {
    const ktx2Url = textureData.ktx2Url
    if (!ktx2Url) return
    if (!this._compressedTexturePromise.has(textureData.hash)) {
      new Promise((resolve) => {
        this._compressedTexturePromise.set(textureData.hash, resolve)
        this.ktx2Loader.load(
          ktx2Url,
          (t) => {
            t.wrapS = ClampToEdgeWrapping
            t.wrapT = ClampToEdgeWrapping
            t.minFilter = LinearMipmapLinearFilter
            t.colorSpace = this.textureEncoding
            this.texturesByHash.get(textureData.hash)!.compressedTexture = t
            resolve(undefined)
          },
          () => {},
          resolve
        )
      })
    }
  }

  _canvasTexturePromise = new Map<string, (value?: any) => void>()

  private _loadCanvasTextureIfNecessary(textureData: TextureData) {
    const threeTextureData = this.texturesByHash.get(textureData.hash)!
    if (threeTextureData.compressedTexture) {
      threeTextureData.canvasTexture?.dispose()
      threeTextureData.canvasTexture = undefined
      return
    }
    const canvas = textureData.canvas
    if (!canvas) return
    if (!threeTextureData.canvasTexture && !threeTextureData.compressedTexture) {
      const t = new CanvasTexture(canvas)
      t.wrapS = ClampToEdgeWrapping
      t.wrapT = ClampToEdgeWrapping
      t.minFilter = LinearMipmapLinearFilter
      t.colorSpace = this.textureEncoding
      t.flipY = false
      threeTextureData.canvasTexture = t
    }
  }
}
