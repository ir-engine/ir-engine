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

import Dexie from 'dexie'
import { CompressedPixelFormat, PixelFormat, TextureDataType } from 'three'

interface TextureData {
  data: Array<any> | ArrayBuffer
  width: number
  height: number
  format: PixelFormat | CompressedPixelFormat
  type: TextureDataType
}

/**
 * ResourceCache using IndexedDB via Dexie
 * Provides storage for assets and resources
 */
class ResourceCacheDatabase extends Dexie {
  resources: Dexie.Table<{ key: string; value: ArrayBuffer; timestamp: number }, string>
  textures: Dexie.Table<{ key: string; value: TextureData; timestamp: number }, string>

  constructor() {
    super('ir-engine-cache', { cache: 'disabled' })
    this.version(1).stores({
      resources: 'key',
      textures: 'key'
    })
  }

  /**
   * Store a resource in the cache
   * @param key The resource key
   * @param value The resource value
   */
  async putResource(key: string, value: ArrayBuffer): Promise<void> {
    await this.resources.put({
      key,
      value,
      timestamp: Date.now()
    })
  }

  /**
   * Get a resource from the cache
   * @param key The resource key
   * @returns The resource value or null if not found
   */
  async getResource(key: string): Promise<Response | null> {
    const resource = await this.resources.get(key)
    return resource ? new Response(resource.value) : null
  }

  /**
   * Check if a resource exists in the cache
   * @param key The resource key
   * @returns True if the resource exists
   */
  async hasResource(key: string): Promise<boolean> {
    return (await this.resources.get(key)) !== undefined
  }

  /**
   * Delete a resource from the cache
   * @param key The resource key
   */
  async deleteResource(key: string): Promise<void> {
    await this.resources.delete(key)
  }

  /**
   * Clear all resources from the cache
   */
  async clearResources(): Promise<void> {
    await this.resources.clear()
  }

  async putTexture(key: string, value: TextureData): Promise<void> {
    await this.textures.put({
      key,
      value,
      timestamp: Date.now()
    })
  }

  async getTexture(key: string): Promise<TextureData | undefined> {
    return (await this.textures.get(key))?.value
  }

  async hasTexture(key: string): Promise<boolean> {
    return (await this.textures.get(key)) !== undefined
  }

  async deleteTexture(key: string): Promise<void> {
    await this.textures.delete(key)
  }

  async clearTextures(): Promise<void> {
    await this.textures.clear()
  }
}

export const ResourceCache = 'indexedDB' in self ? new ResourceCacheDatabase() : null

if (!ResourceCache) {
  console.warn(`ResourceCache not available, cannot offload texture data`)
}
