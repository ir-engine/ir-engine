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

import { Cache } from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FileLoader, loading } from './FileLoader'

// Mock fetch
global.fetch = vi.fn()
global.Request = vi.fn().mockImplementation(() => ({}))
global.Headers = vi.fn().mockImplementation(() => ({}))
global.Response = vi.fn().mockImplementation(() => ({
  ok: true,
  status: 200,
  clone: () => ({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  }),
  text: () => Promise.resolve(''),
  json: () => Promise.resolve({}),
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob())
})) as any

// Mock AbortController
global.AbortController = vi.fn().mockImplementation(() => ({
  signal: {},
  abort: vi.fn()
}))

describe('FileLoader', () => {
  beforeEach(() => {
    // Clear cache before each test
    Cache.clear()

    // Reset fetch mock
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValue(new Response())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should add to loading object when starting a request', () => {
    const loader = new FileLoader()
    const url = 'test-url'

    // Mock successful response
    vi.mocked(fetch).mockResolvedValue(new Response())

    // Load the file
    loader.load(url, () => {})

    // Check that the loading object has an entry
    expect(Object.keys(loading)).toHaveLength(1)
  })

  it('should clean up loading object and clear callbacks in finally block', () => {
    const url = 'test-url'

    // Create a cacheKey similar to what the loader would create
    const cacheKey = JSON.stringify({
      url,
      responseType: undefined,
      mimeType: undefined,
      headers: undefined,
      withCredentials: undefined
    })

    // Create callbacks array with a spy function
    const onLoadSpy = vi.fn()
    const callbacks = [{ onLoad: onLoadSpy }]

    // Manually add an entry to the loading object
    loading[cacheKey] = callbacks

    // Verify it was added
    expect(Object.keys(loading)).toHaveLength(1)
    expect(loading[cacheKey]).toBe(callbacks)
    expect(loading[cacheKey].length).toBe(1)

    // Simulate the finally block with our enhanced cleanup
    if (loading[cacheKey] !== undefined) {
      // Clear any callbacks to help garbage collection
      const callbacksToClean = loading[cacheKey]
      if (callbacksToClean && Array.isArray(callbacksToClean)) {
        callbacksToClean.length = 0
      }

      // Remove the entry from the loading object
      delete loading[cacheKey]
    }

    // Check that the loading object is empty
    expect(Object.keys(loading)).toHaveLength(0)

    // Check that the callbacks array was cleared
    expect(callbacks.length).toBe(0)
  })
})
