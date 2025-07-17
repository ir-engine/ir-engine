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

import { isClient } from '@ir-engine/hyperflux'
import { PromiseQueue } from '@ir-engine/spatial/src/common/classes/PromiseQueue'
import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { ResourceState } from '@ir-engine/spatial/src/resources/ResourceState'
import { ImageLoader, LoadingManager, Texture } from 'three'
import { Loader } from '../base/Loader'
import { ImageBitmapLoader } from '../image/ImageBitmapLoader'

const loadQueue = new PromiseQueue(iOS ? 1 : 4)

const iOSMaxResolution = 1024

const getScaledBitmap = (img: ImageBitmap, maxResolution: number) => {
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

  img.close()

  return canvas.transferToImageBitmap()
}

const minimumAvailableHeapMemoryMB = 100

class TextureLoader extends Loader<Texture> {
  maxResolution: number | undefined
  flipped: boolean

  constructor(manager?: LoadingManager, maxResolution?: number, flipped: boolean = true) {
    super(manager)
    if (maxResolution) this.maxResolution = maxResolution
    else if (iOS) this.maxResolution = iOSMaxResolution
    this.flipped = flipped
  }

  loadImage(
    url: string,
    onLoad: (loadedTexture: ImageBitmap | HTMLImageElement) => void,
    onProgress: ((event: ProgressEvent) => void) | undefined,
    onError: ((err: unknown) => void) | undefined,
    signal: AbortSignal | undefined,
    fallback = false
  ) {
    loadQueue.enqueuePromise(() => {
      return new Promise((resolve, reject) => {
        const handleError = (err: Error) => {
          if (!fallback) {
            console.warn('TextureLoader: Using fallback image loader for', url, 'due to error', err)
            this.loadImage(url, onLoad, onProgress, onError, signal, true)
            return
          }
          onError?.(err)
          reject(err)
        }

        const loadCallback = (img: ImageBitmap | HTMLImageElement) => {
          resolve(img)
          onLoad(img)
        }

        const load = () => {
          let loader
          if (fallback) {
            loader = new ImageLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)
          } else {
            loader = new ImageBitmapLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)
            if (this.flipped) loader.setOptions({ imageOrientation: 'flipY' })
          }
          loader.load(url, loadCallback, onProgress, handleError)
        }

        ResourceState.budgets.waitForAvailableHeapMemory(minimumAvailableHeapMemoryMB).then(() => {
          load()
        })
      })
    })
  }

  override load(
    url: string,
    onLoad: (loadedTexture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {
    const onImage = (i: ImageBitmap | HTMLImageElement) => {
      if (signal?.aborted) return

      const isBitmap = i instanceof ImageBitmap
      const image = this.maxResolution && isBitmap ? getScaledBitmap(i, this.maxResolution) : i
      const texture = new Texture(image)
      if (!isBitmap) texture.flipY = this.flipped
      texture.source.data = image
      texture.needsUpdate = true
      onLoad(texture)
    }

    if (!isClient) {
      onLoad(new Texture())
      return
    }

    this.loadImage(url, onImage, onProgress, onError, signal)
  }
}

export { TextureLoader }
