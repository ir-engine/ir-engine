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

import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { DataTexture, Texture } from 'three'
import { afterEach, beforeEach } from 'vitest'
import { FileLoader } from '../../src/assets/loaders/base/FileLoader'
import { TextureLoader } from '../../src/assets/loaders/texture/TextureLoader'

const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

const original = FileLoader.prototype.load
const textureOriginal = TextureLoader.prototype.load

export function overrideFileLoaderLoad() {
  beforeEach(() => {
    function overrideLoad(url, onLoad, onProgress, onError) {
      try {
        const assetPathAbsolute = path.join(appRootPath.path, url)
        const buffer = toArrayBuffer(fs.readFileSync(assetPathAbsolute))
        onLoad(buffer)
      } catch (e) {
        onError(e)
      }
    }
    FileLoader.prototype.load = overrideLoad
  })
  afterEach(() => {
    FileLoader.prototype.load = original
  })
}

export function overrideTextureLoaderLoad() {
  beforeEach(() => {
    function overrideLoad(
      url: string,
      onLoad: (loadedTexture: Texture) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (err: unknown) => void,
      signal?: AbortSignal
    ) {
      try {
        const assetPathAbsolute = path.join(appRootPath.path, url)
        const buffer = toArrayBuffer(fs.readFileSync(assetPathAbsolute))
        const texture = new DataTexture(buffer)
        onLoad(texture)
      } catch (e) {
        onError?.(e)
      }
    }
    //@ts-ignore
    TextureLoader.prototype.load = overrideLoad
  })
  afterEach(() => {
    TextureLoader.prototype.load = textureOriginal
  })
}

// export const loadGLTFAssetNode = async (assetPath: string, includeMaterials = false): Promise<GLTF> => {
//   const assetPathAbsolute = path.join(appRootPath.path, assetPath)
//   const loader = createGLTFLoader(includeMaterials)
//   const modelBuffer = toArrayBuffer(await fs.promises.readFile(assetPathAbsolute))
//   return new Promise((resolve, reject) => loader.parse(modelBuffer, appRootPath.path, resolve, reject))
// }
