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

import { getState } from '@ir-engine/hyperflux'
import { CompressedPixelFormat, CompressedTexture, CubeTexture, Source, Texture } from 'three'
import { AssetLoaderState } from '../../state/AssetLoaderState'
import { ResourceCache, TextureData } from '../base/ResourceCache'
import { TextureLoader } from './TextureLoader'

type DiscardableSource = Source & { discarded?: boolean }

const cachePromises = {} as Record<string, Promise<boolean>>

/**
 * Offload texture data from memory after it's been uploaded to the GPU
 * @param texture The texture to offload
 * @returns True if the texture was offloaded, false otherwise
 */
export async function offloadTextureData(texture: Texture): Promise<boolean> {
  const url = texture.userData?.url
  if (!url) {
    console.warn(`Texture id ${(texture as any).resourceID} does not have a URL, cannot offload`)
    return false
  }

  if (!ResourceCache) return false

  if (!texture || (!texture.mipmaps && isEmpty(texture.source.data))) {
    console.warn(`Texture is already offloaded or does not have data, cannot offload: ${url}`)
    return false
  }

  const mipmaps = texture.mipmaps
  const data = texture.source.data
  texture.mipmaps = []
  texture.source.data = { width: data.width, height: data.height }
  ;(texture.source as DiscardableSource).discarded = true

  const cleanup = () => {
    if (mipmaps) {
      for (const mipmap of mipmaps) {
        const mipTexture = mipmap as CubeTexture
        mipTexture.source?.data?.close?.()
      }
    }

    data.close?.()
  }

  const cachePromise = cachePromises[url]
  if (cachePromise) {
    cleanup()
    return cachePromise
  }

  if (await ResourceCache.hasTexture(url)) {
    cleanup()
    return false
  }

  const promise = new Promise<boolean>(async (resolve, reject) => {
    if ((texture as CompressedTexture).isCompressedTexture) {
      const compressedTexture = texture as CompressedTexture

      if (mipmaps && mipmaps.length > 0) {
        const textureData = {
          data: mipmaps,
          width: data.width as number,
          height: data.height as number,
          format: compressedTexture.format,
          type: compressedTexture.type
        } as TextureData
        await ResourceCache!.putTexture(url, textureData).catch((err) => {
          console.error(`Error storing texture data: ${err}`)
          reject(err)
        })
      }
    } else if (data instanceof ImageBitmap) {
      const canvas = new OffscreenCanvas(data.width, data.height)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(data, 0, 0)
        const blob = await canvas.convertToBlob({ type: 'image/png' })
        const buffer = await blob.arrayBuffer()
        await ResourceCache!.putTexture(url, {
          data: buffer,
          width: data.width,
          height: data.height,
          format: texture.format,
          type: texture.type
        })
      }
    } else {
      console.warn('Texture data is not a supported type, cannot offload')
    }

    resolve(true)
  })

  promise.catch((err) => {
    console.error(`Error offloading texture data: ${err}`)
    delete cachePromises[url]
  })

  promise.then(() => {
    cleanup()
    delete cachePromises[url]
  })

  cachePromises[url] = promise

  return promise
}

/**
 * Restore texture data from ResourceCache if needed
 * @param texture The texture to restore
 * @returns A promise that resolves when the texture is restored
 */
export async function restoreTextureData(texture: Texture): Promise<boolean> {
  const url = texture.userData?.url
  if (!url) return false

  if (!(texture.source as DiscardableSource).discarded) {
    return false
  }

  if (!ResourceCache) return false
  ;(texture.source as DiscardableSource).discarded = false
  try {
    const textureData = await ResourceCache.getTexture(url)
    if (!textureData) {
      return await loadFromURL(texture)
    }

    if ((texture as CompressedTexture).isCompressedTexture) {
      try {
        if (textureData.data) {
          const compressedTexture = texture as CompressedTexture
          compressedTexture.mipmaps = textureData.data as any
          compressedTexture.source.data.width = textureData.width
          compressedTexture.source.data.height = textureData.height
          compressedTexture.format = textureData.format as CompressedPixelFormat
          compressedTexture.type = textureData.type
          compressedTexture.needsUpdate = true
          return true
        }
      } catch (e) {
        console.error(`Error parsing texture data: ${e}`)
        return await loadFromURL(texture)
      }
    } else {
      try {
        const buffer = textureData.data as ArrayBuffer
        const blob = new Blob([buffer], { type: 'image/png' })
        const imageBitmap = await createImageBitmap(blob)

        texture.source.data = imageBitmap
        texture.needsUpdate = true
        return true
      } catch (e) {
        return await loadFromURL(texture)
      }
    }
  } catch (error) {
    console.error(`Error restoring texture data: ${error}`)
    return await loadFromURL(texture)
  }

  return false
}

/**
 * Load a texture from its URL
 * @param texture The texture to load
 * @returns A promise that resolves to true if loading was successful
 */
async function loadFromURL(texture: Texture | CompressedTexture): Promise<boolean> {
  const url = texture.userData?.url
  if (!url) return false

  try {
    const loader = 'isCompressedTexture' in texture ? getState(AssetLoaderState).ktx2Loader : new TextureLoader()

    return new Promise<boolean>((resolve) => {
      loader.load(
        url,
        (newTexture: Texture | CompressedTexture) => {
          texture.source.data = newTexture.source.data
          texture.mipmaps = newTexture.mipmaps
          texture.needsUpdate = true
          resolve(true)
        },
        undefined,
        () => {
          console.error(`Failed to restore texture from URL: ${url}`)
          resolve(false)
        }
      )
    })
  } catch (error) {
    console.error(`Error loading texture from URL: ${error}`)
    return false
  }
}

/**
 * Check if a texture needs to be restored before use
 * @param texture The texture to check
 * @returns True if the texture needs restoration
 */
export function textureNeedsRestoration(texture: Texture): boolean {
  return !!(texture.source as DiscardableSource).discarded
}

function isEmpty(obj) {
  for (let i in obj) {
    return false
  }
  return true
}

/**
 * Get the size of the texture data cache (number of entries)
 */
export async function getTextureCacheSize(): Promise<number> {
  if (!ResourceCache) return 0

  try {
    const textures = await ResourceCache.textures.toArray()
    return textures.length
  } catch (error) {
    console.error(`Error getting texture cache size: ${error}`)
    return 0
  }
}

Texture.prototype.offloadTextureData = function () {
  return offloadTextureData(this)
}
