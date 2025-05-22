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
import { CompressedTexture, Texture } from 'three'
import { AssetLoaderState } from '../../state/AssetLoaderState'
import { ResourceCache } from '../base/ResourceCache'
import { TextureLoader } from './TextureLoader'

/**
 * Prefix for texture data stored in ResourceCache
 * Using URLs directly as keys since they're already content-hashed
 */
const TEXTURE_CACHE_PREFIX = 'texture_'

const cachePromises = {} as Record<string, Promise<boolean>>

/**
 * Offload texture data from memory after it's been uploaded to the GPU
 * @param texture The texture to offload
 * @returns True if the texture was offloaded, false otherwise
 */
export async function offloadTextureData(texture: Texture): Promise<boolean> {
  // Skip if ResourceCache is not available
  if (!ResourceCache) return false

  // Skip if texture is already offloaded or doesn't have data
  if (!texture || (!texture.mipmaps && isEmpty(texture.source.data))) return false

  // We need a URL to be able to restore the texture later
  const url = texture.userData?.url
  if (!url) return false

  const mipmaps = texture.mipmaps
  const data = texture.source.data
  texture.mipmaps = []
  texture.source.data = {}

  const cachePromise = cachePromises[url]
  if (cachePromise) return cachePromise

  if (await ResourceCache.has(`${TEXTURE_CACHE_PREFIX}${url}`)) return false

  const promise = new Promise<boolean>(async (resolve, reject) => {
    // For compressed textures, store mipmaps
    if ((texture as CompressedTexture).isCompressedTexture) {
      const compressedTexture = texture as CompressedTexture

      // Only cache if we have mipmaps
      if (mipmaps?.length > 0) {
        // Create a serializable object with all the texture data
        const textureData = {
          mipmaps: mipmaps.map((mip) => ({
            width: mip.width,
            height: mip.height,
            data: Array.from(new Uint8Array(mip.data)) // Convert to regular array for serialization
          })),
          width: data.width,
          height: data.height,
          format: compressedTexture.format,
          type: compressedTexture.type
        }

        // Store in ResourceCache
        const encoded = new TextEncoder().encode(JSON.stringify(textureData))
        await ResourceCache!.put(`${TEXTURE_CACHE_PREFIX}${url}`, encoded.buffer as ArrayBuffer).catch((err) => {
          console.error(`Error storing texture data: ${err}`)
          reject(err)
        })
      }
    } else if (data instanceof ImageBitmap) {
      // For regular textures with ImageBitmap, convert to PNG and store
      const canvas = new OffscreenCanvas(data.width, data.height)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(data, 0, 0)
        const blob = await canvas.convertToBlob({ type: 'image/png' })
        const buffer = await blob.arrayBuffer()
        // Store in ResourceCache
        await ResourceCache!.put(`${TEXTURE_CACHE_PREFIX}${url}`, buffer)
        // Close the ImageBitmap to free memory
        data.close()
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
  // Skip if texture already has meaningful data
  if (
    texture.source.data &&
    typeof texture.source.data === 'object' &&
    Object.keys(texture.source.data).length > 0 &&
    !(texture.source.data instanceof Object && Object.keys(texture.source.data).length === 0)
  ) {
    return true
  }

  // Get the URL from the texture
  const url = texture.userData?.url
  if (!url) return false

  // Skip if ResourceCache is not available
  if (!ResourceCache) return false

  try {
    // Try to get cached data from ResourceCache
    const response = await ResourceCache.get(`${TEXTURE_CACHE_PREFIX}${url}`)
    if (!response) {
      // If no cached data, reload from URL
      return await loadFromURL(texture)
    }

    const buffer = await response.arrayBuffer()

    // For compressed textures
    if ((texture as CompressedTexture).isCompressedTexture) {
      try {
        // Try to parse the buffer as JSON (for compressed textures)
        const textDataString = new TextDecoder().decode(buffer)
        const textureData = JSON.parse(textDataString)

        if (textureData.mipmaps) {
          const compressedTexture = texture as CompressedTexture

          // Convert the array data back to typed arrays
          const mipmaps = textureData.mipmaps.map((mip: any) => ({
            width: mip.width,
            height: mip.height,
            data: new Uint8Array(mip.data).buffer
          }))

          // Restore mipmaps and dimensions
          compressedTexture.mipmaps = mipmaps
          if (textureData.width) compressedTexture.source.data.width = textureData.width
          if (textureData.height) compressedTexture.source.data.height = textureData.height
          return true
        }
      } catch (e) {
        // If parsing fails, try to load from URL
        return await loadFromURL(texture)
      }
    } else {
      // For regular textures, create an ImageBitmap from the buffer
      try {
        const blob = new Blob([buffer], { type: 'image/png' })
        const imageBitmap = await createImageBitmap(blob)

        // Set the texture's source data
        texture.source.data = imageBitmap
        texture.needsUpdate = true
        return true
      } catch (e) {
        // If creating ImageBitmap fails, try to load from URL
        return await loadFromURL(texture)
      }
    }
  } catch (error) {
    console.error(`Error restoring texture data: ${error}`)
    // If any error occurs, try to load from URL
    return await loadFromURL(texture)
  }

  // If we get here, something went wrong
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
    // Create a new TextureLoader instance
    const loader = 'isCompressedTexture' in texture ? getState(AssetLoaderState).ktx2Loader : new TextureLoader()

    return new Promise<boolean>((resolve) => {
      loader.load(
        url,
        // onLoad
        (newTexture: Texture | CompressedTexture) => {
          // Copy the new texture's source data to our texture
          texture.source.data = newTexture.source.data
          texture.mipmaps = newTexture.mipmaps
          texture.needsUpdate = true
          resolve(true)
        },
        // onProgress
        undefined,
        // onError
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
  return !texture.source.data || isEmpty(texture.source.data)
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
    // Get all keys from ResourceCache
    const resources = await ResourceCache.resources.toArray()

    // Count texture data entries
    return resources.filter((resource) => resource.key.startsWith(TEXTURE_CACHE_PREFIX)).length
  } catch (error) {
    console.error(`Error getting texture cache size: ${error}`)
    return 0
  }
}

Texture.prototype.offloadTextureData = function () {
  return offloadTextureData(this)
}
