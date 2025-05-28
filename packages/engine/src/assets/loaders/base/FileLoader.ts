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

import { Cache, LoadingManager } from 'three'

import { parseStorageProviderURLs } from '../../functions/parseSceneJSON'
import { Loader } from './Loader'
import { ResourceCache } from './ResourceCache'

// Track in-progress requests
export const loading = {}
class HttpError extends Error {
  response: Response
  constructor(message: string, response: Response) {
    super(message)
    this.response = response
  }
}

class FileLoader<TData = unknown> extends Loader<TData> {
  mimeType: undefined | any
  responseType: undefined | string

  constructor(manager?: LoadingManager) {
    manager?.setURLModifier((url) => parseStorageProviderURLs(url))
    super(manager)
  }

  override load(
    url: string,
    onLoad: (data: TData) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {
    if (url === undefined) url = ''

    if (this.path !== undefined) url = this.path + url

    url = this.manager.resolveURL(url)

    // Create a cache key
    const cacheKey = JSON.stringify({
      url,
      responseType: this.responseType,
      mimeType: this.mimeType,
      headers: this.requestHeader,
      withCredentials: this.withCredentials
    })
    const cached = Cache.get(cacheKey) || Cache.get(url)

    if (cached !== undefined) {
      this.manager.itemStart(url)

      // for some reason, not having setTimeout can cause weird issues with reactors when coming from the cache
      setTimeout(() => {
        if (onLoad) onLoad(cached)
      }, 0)

      this.manager.itemEnd(url)

      return cached
    }

    // Check if request is duplicate

    if (loading[cacheKey] !== undefined) {
      loading[cacheKey].push({
        onLoad: onLoad,
        onProgress: onProgress,
        onError: onError
      })

      return
    }

    // Initialise array for duplicate requests
    loading[cacheKey] = []

    loading[cacheKey].push({
      onLoad: onLoad,
      onProgress: onProgress,
      onError: onError
    })

    const isBlob = url.startsWith('blob:')

    // create request
    const req = new Request(url, {
      headers: new Headers(this.requestHeader),
      credentials: this.withCredentials ? 'include' : 'same-origin'
    })

    // record states ( avoid data race )
    const mimeType = this.mimeType
    const responseType = this.responseType
    const manager = this.manager

    // use native cache if available
    let fromCache = false
    let responsePromise: Promise<Response>
    if (!isBlob && ResourceCache) {
      responsePromise = ResourceCache.get(req.url).then((response) => {
        if (!response) return fetch(req, { signal })
        fromCache = true
        console.log(`Loaded from cache: ${req.url}`)
        return response
      })
    } else {
      responsePromise = fetch(req, { signal })
    }

    // start the fetch
    responsePromise
      .then((response) => {
        if (response.ok || response.status === 0) {
          // Some browsers return HTTP Status 0 when using non-http protocol
          // e.g. 'file://' or 'data://'. Handle as success.

          // If the response is already loaded (e.g. blob: URLs), or streaming is not supported, return the response
          if (
            typeof ReadableStream === 'undefined' ||
            response.body == undefined ||
            response.body.getReader == undefined ||
            isBlob ||
            fromCache
          ) {
            return response
          }

          const callbacks = loading[cacheKey]
          const reader = response.body.getReader()

          // Nginx needs X-File-Size check
          // https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
          const contentLength = response.headers.get('Content-Length') || response.headers.get('X-File-Size')
          const total = contentLength ? parseInt(contentLength) : 0
          const lengthComputable = total !== 0
          let loaded = 0

          // periodically read data into the new stream tracking while download progress
          const stream = new ReadableStream({
            start(controller) {
              readData()

              function readData() {
                reader
                  .read()
                  .then(({ done, value }) => {
                    if (done) {
                      controller.close()
                    } else {
                      loaded += value.byteLength

                      const event = new ProgressEvent('progress', { lengthComputable, loaded, total })
                      for (let i = 0, il = callbacks.length; i < il; i++) {
                        const callback = callbacks[i]
                        if (callback.onProgress) callback.onProgress(event)
                      }

                      controller.enqueue(value)
                      readData()
                    }
                  })
                  .catch((err) => {
                    delete loading[cacheKey]

                    for (let i = 0, il = callbacks.length; i < il; i++) {
                      const callback = callbacks[i]
                      if (callback.onError) callback.onError(err)
                    }

                    // Clean up reader and controller
                    reader.cancel().catch(() => {})
                    controller.error(err)

                    manager.itemError(url)
                  })
              }
            }
          })

          return new Response(stream)
        } else {
          throw new HttpError(
            `fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`,
            response
          )
        }
      })
      .then((response) => {
        if (!isBlob && ResourceCache) {
          return response
            .clone()
            .arrayBuffer()
            .then((buffer) => {
              return ResourceCache!.put(req.url, buffer)
            })
            .then(() => {
              return response
            })
        } else {
          return response
        }
      })
      .then((response) => {
        switch (responseType) {
          case 'arraybuffer':
            return response.arrayBuffer()

          case 'blob':
            return response.blob()

          case 'document':
            return response.text().then((text) => {
              const parser = new DOMParser()
              return parser.parseFromString(text, mimeType)
            })

          case 'json':
            return response.json()

          default:
            if (mimeType === undefined) {
              return response.text()
            } else {
              // sniff encoding
              const re = /charset="?([^;"\s]*)"?/i
              const exec = re.exec(mimeType)
              const label = exec && exec[1] ? exec[1].toLowerCase() : undefined
              const decoder = new TextDecoder(label)
              return response.arrayBuffer().then((ab) => decoder.decode(ab))
            }
        }
      })
      .then((data) => {
        if (!data) throw new Error('No data returned from fetch')
        // Add to cache with response type in the key
        Cache.add(cacheKey, data)

        const callbacks = loading[cacheKey]
        delete loading[cacheKey]

        // Make a local copy of the data to avoid reference issues
        const processedData = data

        // Call all callbacks with the processed data
        for (let i = 0, il = callbacks ? callbacks.length : 0; i < il; i++) {
          const callback = callbacks[i]
          if (callback.onLoad) callback.onLoad(processedData)
        }

        // Clear references to help garbage collection
        callbacks.length = 0
      })
      .catch((err) => {
        // Abort errors and other errors are handled the same
        const callbacks = loading[cacheKey]

        if (callbacks === undefined) {
          // When onLoad was called and url was deleted in `loading`
          this.manager.itemError(url)
          throw err
        }

        delete loading[cacheKey]

        // Make a local copy of the error to avoid reference issues
        const processedError = err instanceof Error ? err : new Error(String(err))

        // Call all error callbacks
        for (let i = 0, il = callbacks.length; i < il; i++) {
          const callback = callbacks[i]
          if (callback.onError) callback.onError(processedError)
        }

        // Clear references to help garbage collection
        callbacks.length = 0

        this.manager.itemError(url)
      })
      .finally(() => {
        // Ensure loading object is cleaned up to prevent memory leaks
        if (loading[cacheKey] !== undefined) {
          // Clear any callbacks to help garbage collection
          const callbacks = loading[cacheKey]
          if (callbacks && Array.isArray(callbacks)) {
            callbacks.length = 0
          }

          // Remove the entry from the loading object
          delete loading[cacheKey]
        }

        this.manager.itemEnd(url)
      })

    this.manager.itemStart(url)
  }

  setResponseType(value: string): this {
    this.responseType = value
    return this
  }

  setMimeType(value: string): this {
    this.mimeType = value
    return this
  }
}

export { FileLoader }
