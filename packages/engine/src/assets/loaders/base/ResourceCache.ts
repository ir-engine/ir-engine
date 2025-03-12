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

/**
 * ResourceCache using IndexedDB via Dexie
 * Provides storage for assets and resources
 */
class ResourceCacheDatabase extends Dexie {
  resources: Dexie.Table<{ key: string; value: any; timestamp: number }, string>

  constructor() {
    super('ir-engine-cache')
    this.version(1).stores({
      resources: 'key'
    })
  }

  /**
   * Store a resource in the cache
   * @param key The resource key
   * @param value The resource value
   */
  async put(key: string, value: ArrayBuffer): Promise<void> {
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
  async get(key: string): Promise<Response | null> {
    const resource = await this.resources.get(key)
    return resource ? new Response(resource.value) : null
  }

  /**
   * Check if a resource exists in the cache
   * @param key The resource key
   * @returns True if the resource exists
   */
  async has(key: string): Promise<boolean> {
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
  async clear(): Promise<void> {
    await this.resources.clear()
  }
}

export const ResourceCache = 'indexedDB' in self ? new ResourceCacheDatabase() : null
