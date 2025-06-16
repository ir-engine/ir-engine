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
import { iOS } from '@ir-engine/spatial/src/common/functions/isMobile'
import { LoadingManager, Texture } from 'three'
import { Loader } from '../base/Loader'
import { ImageBitmapLoader } from '../image/ImageBitmapLoader'

// import resource state such that we have type override
import '@ir-engine/spatial/src/resources/ResourceState'

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

  return canvas.transferToImageBitmap()
}

class TextureLoader extends Loader<Texture> {
  maxResolution: number | undefined
  flipped: boolean

  constructor(manager?: LoadingManager, maxResolution?: number, flipped: boolean = true) {
    super(manager)
    if (maxResolution) this.maxResolution = maxResolution
    else if (iOS) this.maxResolution = iOSMaxResolution
    this.flipped = flipped
  }

  override async load(
    url: string,
    onLoad: (loadedTexture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {
    const texture = new Texture()

    texture.userData = { url }

    if (!isClient) {
      onLoad(texture)
      return
    }

    const loader = new ImageBitmapLoader(this.manager).setCrossOrigin(this.crossOrigin).setPath(this.path)

    if (this.flipped) loader.setOptions({ imageOrientation: 'flipY' })

    const onImage = (i: ImageBitmap) => {
      if (signal?.aborted) return
      const isBitmap = i instanceof ImageBitmap
      const image = this.maxResolution && isBitmap ? getScaledBitmap(i, this.maxResolution) : i
      if (!isBitmap) texture.flipY = this.flipped
      texture.source.data = image
      texture.flipY = !this.flipped
      texture.needsUpdate = true
      onLoad(texture)
    }

    loader.load(url, onImage, onProgress, onError)
  }
}

export { TextureLoader }
