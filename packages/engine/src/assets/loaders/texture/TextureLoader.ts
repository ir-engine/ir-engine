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

import { isClient } from '@ir-engine/hyperflux'
import { PromiseQueue } from '@ir-engine/spatial/src/common/classes/PromiseQueue'
import { firefoxVersion, iOS, isFirefox, isSafari } from '@ir-engine/spatial/src/common/functions/isMobile'
import { ImageBitmapLoader, ImageLoader, LoadingManager, Texture } from 'three'
import { Loader } from '../base/Loader'

// Do we still need this check if we're now reliant on a browser that's new enough to have ArrayBuffer.resize?
const useImageLoader = typeof createImageBitmap === 'undefined' || isSafari || (isFirefox && firefoxVersion < 98)
const iOSMaxResolution = 1024
const decodeQueue = new PromiseQueue<[ImageBitmap | null, unknown | null]>(2)

/** @todo make this accessible for performance scaling */
const getScaledBitmap = async (src: string, maxResolution: number): Promise<[ImageBitmap | null, unknown | null]> => {
  return decodeQueue.enqueuePromise(() => {
    return new Promise(async (resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' //browser will yell without this
      img.src = src

      try {
        await img.decode()
      } catch (error) {
        resolve([null, error])
        return
      }

      // Set width and height
      const originalWidth = img.width
      const originalHeight = img.height

      let resizingFactor = 1
      if (originalWidth >= originalHeight) {
        if (originalWidth > maxResolution) {
          resizingFactor = maxResolution / originalWidth
        }
      } else {
        if (originalHeight > maxResolution) {
          resizingFactor = maxResolution / originalHeight
        }
      }

      const canvasWidth = originalWidth * resizingFactor
      const canvasHeight = originalHeight * resizingFactor

      const canvas = new OffscreenCanvas(canvasWidth, canvasHeight)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

      resolve([canvas.transferToImageBitmap(), null])
    })
  })
}

class TextureLoader extends Loader<Texture> {
  maxResolution: number | undefined
  autoDetectBitmap: boolean | undefined

  constructor(manager?: LoadingManager, autoDetectBitmap?: boolean, maxResolution?: number) {
    super(manager)
    if (maxResolution) this.maxResolution = maxResolution
    else if (iOS) this.maxResolution = iOSMaxResolution
    this.autoDetectBitmap = autoDetectBitmap
  }

  override async load(
    url: string,
    onLoad: (loadedTexture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {
    const onImage = (image: HTMLImageElement | ImageBitmap) => {
      const texture = new Texture(image)
      texture.userData.url = url
      texture.source.data.src = url

      const completedLoading = () => {
        texture.needsUpdate = true
        onLoad(texture)
      }

      // workaround for threejs freaking out when texture is set before image is complete
      if (texture.source.data instanceof HTMLImageElement) {
        if (texture.source.data.complete) {
          completedLoading()
        } else {
          const onload = () => {
            completedLoading()
            texture.source.data.removeEventListener('load', onload)
          }
          texture.source.data.addEventListener('load', onload)
        }
      } else {
        completedLoading()
      }
    }

    if (!isClient) {
      onLoad(new Texture())
      return
    }

    if (this.maxResolution) {
      const [imageBitmap, error] = await getScaledBitmap(url, this.maxResolution)
      if (error) {
        onError?.(error)
        return
      }

      if (imageBitmap) onImage(imageBitmap)
      else onError?.(new Error(`TextureLoader:load Unable to create scaled image bitmap for image url: ${url}`))
      return
    }

    // Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
    // expensive work of uploading a texture to the GPU off the main thread.
    let loader: ImageLoader | ImageBitmapLoader
    if (useImageLoader || !this.autoDetectBitmap)
      loader = new ImageLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)
    else loader = new ImageBitmapLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)
    loader.load(url, onImage, onProgress, onError)
  }
}

export { TextureLoader }
