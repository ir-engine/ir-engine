/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

// Adapted from https://github.com/codepo8/canvasthumber
function resize(imageWidth: number, imageHeight: number, thumbWidth: number, thumbHeight: number) {
  let w = 0,
    h = 0,
    x = 0,
    y = 0
  const widthRatio = imageWidth / thumbWidth,
    heightRatio = imageHeight / thumbHeight,
    maxRatio = Math.max(widthRatio, heightRatio)
  if (maxRatio > 1) {
    w = imageWidth / maxRatio
    h = imageHeight / maxRatio
  } else {
    w = imageWidth
    h = imageHeight
  }
  x = (thumbWidth - w) / 2
  y = (thumbHeight - h) / 2
  return { w: w, h: h, x: x, y: y }
}

export async function generateImageFileThumbnail(
  file: Blob | MediaSource,
  width?: number,
  height?: number,
  background?: string
): Promise<Blob | null> {
  const url = URL.createObjectURL(file)
  const img = new Image()

  await new Promise((resolve, reject) => {
    img.src = url
    img.onload = resolve
    img.onerror = reject
  })

  URL.revokeObjectURL(url)
  return generateMediaThumbnail(img, width, height, background)
}

export async function generateVideoFileThumbnail(
  file: Blob | MediaSource,
  width?: number,
  height?: number,
  background?: string
): Promise<Blob | null> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')

  await new Promise((resolve, reject) => {
    video.src = url
    video.onloadeddata = resolve
    video.onerror = reject
  })

  URL.revokeObjectURL(url)

  await new Promise((resolve, reject) => {
    video.currentTime = 1
    video.onseeked = resolve
    video.onerror = reject
  })

  return generateMediaThumbnail(video, width, height, background)
}

export async function generateMediaThumbnail(
  el: HTMLImageElement | HTMLVideoElement,
  width = 256,
  height = 256,
  background = '#000'
): Promise<Blob | null> {
  const elWidth = el instanceof HTMLInputElement ? el.width : (el as HTMLVideoElement).videoWidth
  const elHeight = el instanceof HTMLInputElement ? el.height : (el as HTMLVideoElement).videoHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!
  const dimensions = resize(elWidth, elHeight, width, height)

  if (background !== 'transparent') {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
  }

  ctx.drawImage(el, dimensions.x, dimensions.y, dimensions.w, dimensions.h)

  return getCanvasBlob(canvas, background === 'transparent' ? 'image/png' : undefined)
}

export function getCanvasBlob(canvas: HTMLCanvasElement, fileType = 'image/jpeg', quality = 0.9): Promise<Blob | null> {
  if ((canvas as any).msToBlob) {
    return Promise.resolve((canvas as any).msToBlob())
  } else {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, fileType, quality))
  }
}
