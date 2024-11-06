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
import { firefoxVersion, iOS, isFirefox, isSafari } from '@ir-engine/spatial/src/common/functions/isMobile'
import { ImageBitmapLoader, ImageLoader, LoadingManager, Texture } from 'three'
import { Loader } from '../base/Loader'

const useImageLoader = typeof createImageBitmap === 'undefined' || isSafari || (isFirefox && firefoxVersion < 98)
const iOSMaxResolution = 1024

/** @todo make this accessible for performance scaling */
const getScaledTextureURI = async (src: string, maxResolution: number): Promise<[string, HTMLCanvasElement]> => {
  return new Promise(async (resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' //browser will yell without this
    img.src = src
    await img.decode() //new way to wait for image to load
    // Initialize the canvas and it's size
    const canvas = document.createElement('canvas') //dead dom elements? Remove after Three loads them
    const ctx = canvas.getContext('2d')

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

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Draw image and export to a data-uri
    ctx?.drawImage(img, 0, 0, canvasWidth, canvasHeight)
    const dataURI = canvas.toDataURL()

    // Do something with the result, like overwrite original
    resolve([dataURI, canvas])
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
    let canvas: HTMLCanvasElement | undefined = undefined
    if (this.maxResolution) {
      ;[url, canvas] = await getScaledTextureURI(url, this.maxResolution)
    }

    if (!isClient) {
      onLoad(new Texture())
      return
    }

    // Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
    // expensive work of uploading a texture to the GPU off the main thread.
    let loader: ImageLoader | ImageBitmapLoader
    if (useImageLoader || !this.autoDetectBitmap)
      loader = new ImageLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)
    else loader = new ImageBitmapLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)
    loader.load(
      url,
      (image: HTMLImageElement | ImageBitmap) => {
        const texture = new Texture(image)
        texture.needsUpdate = true
        if (canvas) canvas.remove()
        onLoad(texture)
      },
      onProgress,
      onError
    )
  }
}

export { TextureLoader }
