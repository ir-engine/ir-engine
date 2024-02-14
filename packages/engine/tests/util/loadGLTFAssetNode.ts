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

import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { FileLoader } from '../../src/assets/loaders/base/FileLoader'

const toArrayBuffer = (buf) => {
  const arrayBuffer = new ArrayBuffer(buf.length)
  const view = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return arrayBuffer
}

export function overrideFileLoaderLoad() {
  FileLoader.prototype.load = overrideLoad

  function overrideLoad(url, onLoad, onProgress, onError) {
    try {
      const assetPathAbsolute = path.join(appRootPath.path, url)
      const buffer = toArrayBuffer(fs.readFileSync(assetPathAbsolute))
      onLoad(buffer)
    } catch (e) {
      onError(e)
    }
  }
}

// export const loadGLTFAssetNode = async (assetPath: string, includeMaterials = false): Promise<GLTF> => {
//   const assetPathAbsolute = path.join(appRootPath.path, assetPath)
//   const loader = createGLTFLoader(includeMaterials)
//   const modelBuffer = toArrayBuffer(await fs.promises.readFile(assetPathAbsolute))
//   return new Promise((resolve, reject) => loader.parse(modelBuffer, appRootPath.path, resolve, reject))
// }
