import { MathUtils, PerspectiveCamera } from 'three'

import { Engine } from '../../ecs/classes/Engine'

export function computeContentScaleForCamera(
  distance: number,
  contentWidth: number,
  contentHeight: number,
  fit: 'cover' | 'contain' | 'vertical' | 'horizontal' = 'contain',
  camera = Engine.camera as PerspectiveCamera
) {
  const ratioContent = contentWidth / contentHeight
  const ratioCamera = camera.aspect

  const useHeight =
    fit === 'cover'
      ? ratioContent > ratioCamera
      : fit === 'contain'
      ? ratioContent < ratioCamera
      : fit === 'vertical'
      ? true
      : false

  const vFOV = MathUtils.degToRad(camera.fov)
  const targetHeight = Math.tan(vFOV / 2) * distance * 2
  const targetWidth = targetHeight * camera.aspect

  let scale = 1
  if (useHeight) {
    scale = targetHeight / contentHeight
  } else {
    scale = targetWidth / contentWidth
  }

  return scale
}
