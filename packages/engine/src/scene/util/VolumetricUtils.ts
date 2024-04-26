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

import { getState } from '@etherealengine/hyperflux'
import { BufferGeometry, CompressedTexture, Mesh, Vector2 } from 'three'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import getFirstMesh from './meshUtils'

export const loadCorto = (url: string, byteStart: number, byteEnd: number) => {
  if (!getState(AssetLoaderState).cortoLoader) {
    throw new Error('loadCorto:CORTOLoader is not available')
  }

  return new Promise<BufferGeometry>((res, rej) => {
    getState(AssetLoaderState).cortoLoader.load(url, byteStart, byteEnd, (geometry) => {
      if (geometry === null) {
        rej(`loadCorto:Failed to load Corto geometry frame from ${url} at bytes ${byteStart} to ${byteEnd}`)
      } else {
        res(geometry)
      }
    })
  })
}

export const loadDraco = (url: string) => {
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  if (!gltfLoader) {
    throw new Error('loadDraco:GLTFLoader is not available')
  }
  const dracoLoader = gltfLoader.dracoLoader
  if (!dracoLoader) {
    throw new Error('loadDraco:DracoLoader is not available')
  }

  return new Promise<{ geometry: BufferGeometry; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    dracoLoader.load(
      url,
      (geometry: BufferGeometry) => {
        resolve({ geometry, fetchTime: performance.now() - startTime })
      },
      undefined,
      (error) => {
        reject(`loadDraco:Error loading draco geometry from ${url}: ${error.message}`)
      }
    )
  })
}

export const loadGLTF = (url: string) => {
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  if (!gltfLoader) {
    throw new Error('loadDraco:GLTFLoader is not available')
  }

  return new Promise<{ mesh: Mesh; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    gltfLoader.load(
      url,
      ({ scene }: GLTF) => {
        const mesh = getFirstMesh(scene)!
        resolve({ mesh, fetchTime: performance.now() - startTime })
      },
      undefined,
      (err) => {
        console.error('Error loading geometry: ', url, err)
        reject(`loadGLTF:Error loading geometry from ${url}: ${err.message}`)
      }
    )
  })
}

export const loadKTX2 = (url: string, _repeat?: Vector2, _offset?: Vector2) => {
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  if (!gltfLoader) {
    throw new Error('loadKTX2:GLTFLoader is not available')
  }
  const ktx2Loader = gltfLoader.ktx2Loader
  if (!ktx2Loader) {
    throw new Error('loadKTX2:KTX2Loader is not available')
  }

  const repeat = _repeat || new Vector2(1, 1)
  const offset = _offset || new Vector2(0, 0)

  return new Promise<{ texture: CompressedTexture; fetchTime: number }>((resolve, reject) => {
    const startTime = performance.now()
    ktx2Loader.load(
      url,
      (texture: CompressedTexture) => {
        texture.repeat.copy(repeat)
        texture.offset.copy(offset)
        texture.updateMatrix()
        resolve({ texture, fetchTime: performance.now() - startTime })
      },
      undefined,
      (err) => {
        reject(`loadKTX2:Error loading KTX2 Texture from ${url}: ${err.message}`)
      }
    )
  })
}
