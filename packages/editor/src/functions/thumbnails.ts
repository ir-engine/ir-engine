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
