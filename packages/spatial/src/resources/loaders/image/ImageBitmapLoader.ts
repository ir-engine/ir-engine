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

import { Cache, Loader } from 'three'
import { FileLoader } from '../base/FileLoader'

class ImageBitmapLoader extends Loader<ImageBitmap> {
  isImageBitmapLoader = true
  options: ImageBitmapOptions

  constructor(manager) {
    super(manager)

    if (typeof createImageBitmap === 'undefined') {
      console.warn('THREE.ImageBitmapLoader: createImageBitmap() not supported.')
    }

    if (typeof fetch === 'undefined') {
      console.warn('THREE.ImageBitmapLoader: fetch() not supported.')
    }

    this.options = { premultiplyAlpha: 'none' }
  }

  setOptions(options) {
    this.options = options

    return this
  }

  load(url, onLoad, onProgress, onError) {
    if (url === undefined) url = ''

    if (this.path !== undefined) url = this.path + url

    url = this.manager.resolveURL(url)

    const manager = this.manager
    const options = this.options

    const cached = Cache.get(url)

    if (cached !== undefined) {
      manager.itemStart(url)

      setTimeout(function () {
        if (onLoad) onLoad(cached)

        manager.itemEnd(url)
      }, 0)

      return cached
    }

    const loader = new FileLoader<Blob>(this.manager)

    loader.setPath(this.path)
    loader.setResponseType('blob')
    loader.setCrossOrigin(this.crossOrigin)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    const handleFileError = (error) => {
      console.warn(`Error loading image file from URL: ${url}`, error)
      if (onError) onError(error)
      manager.itemError(url)
      manager.itemEnd(url)
    }

    function onFile(blob: Blob) {
      try {
        createImageBitmap(blob, {
          ...options,
          colorSpaceConversion: 'none' as ColorSpaceConversion
        })
          .then(function (imageBitmap) {
            Cache.add(url, imageBitmap)
            if (onLoad) onLoad(imageBitmap)
            manager.itemEnd(url)
          })
          .catch(function (e) {
            // Log detailed error information
            console.error(`Error creating ImageBitmap from blob for URL: ${url}`, {
              error: e,
              errorName: e.name,
              errorMessage: e.message,
              blobType: blob.type,
              blobSize: blob.size
            })

            // Try to read the blob as text to see if it contains an error message
            const reader = new FileReader()
            reader.onload = function () {
              const text = reader.result as string
              // Only log the first 200 characters to avoid flooding the console
              // console.log(`Blob content preview for ${url}:`, text.substring(0, 200))
            }
            reader.onerror = function () {
              console.log(`Could not read blob content for ${url}`)
            }

            // Only try to read as text if it might be a text response
            if (blob.type.includes('text') || blob.type.includes('json')) {
              reader.readAsText(blob)
            }

            if (onError) onError(e)
            manager.itemError(url)
            manager.itemEnd(url)
          })
      } catch (error) {
        handleFileError(error)
      }
    }

    loader.load(url, onFile, onProgress, handleFileError)

    manager.itemStart(url)
  }
}

export { ImageBitmapLoader }
