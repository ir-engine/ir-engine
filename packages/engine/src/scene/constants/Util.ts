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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Color, CubeTexture, CubeTextureLoader } from 'three'

export const getRGBArray = (color: Color): Uint8Array => {
  const resolution = 64 // Min value required
  const size = resolution * resolution
  const data = new Uint8Array(4 * size)

  for (let i = 0; i < size; i++) {
    const stride = i * 4
    data[stride] = Math.floor(color.r * 255)
    data[stride + 1] = Math.floor(color.g * 255)
    data[stride + 2] = Math.floor(color.b * 255)
    data[stride + 3] = 255
  }

  return data
}

export const loadCubeMapTexture = (
  path: string,
  onLoad: (texture: CubeTexture) => void,
  onProgress?: (event: ProgressEvent<EventTarget>) => void,
  onError?: (event: ErrorEvent) => void
): void => {
  const negx = '/negx.jpg'
  const negy = '/negy.jpg'
  const negz = '/negz.jpg'
  const posx = '/posx.jpg'
  const posy = '/posy.jpg'
  const posz = '/posz.jpg'
  if (path[path.length - 1] === '/') path = path.slice(0, path.length - 1)
  const cubeTextureLoader = new CubeTextureLoader()
  cubeTextureLoader.setPath(path).load(
    [posx, negx, posy, negy, posz, negz],
    (texture) => {
      onLoad(texture)
    },
    (res) => {
      if (onProgress) onProgress(res)
    },
    (error: any) => {
      if (onError) onError(error)
    }
  )
}
