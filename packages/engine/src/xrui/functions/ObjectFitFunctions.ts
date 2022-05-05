import { MathUtils, Object3D, PerspectiveCamera } from 'three'

import { Engine } from '../../ecs/classes/Engine'

export const ObjectFitFunctions = {
  computeContentFitScale: (
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number,
    fit: 'cover' | 'contain' | 'vertical' | 'horizontal' = 'contain'
  ) => {
    const ratioContent = contentWidth / contentHeight
    const ratioContainer = containerWidth / containerHeight

    const useHeight =
      fit === 'cover'
        ? ratioContent > ratioContainer
        : fit === 'contain'
        ? ratioContent < ratioContainer
        : fit === 'vertical'
        ? true
        : false

    let scale = 1
    if (useHeight) {
      scale = containerHeight / contentHeight
    } else {
      scale = containerWidth / contentWidth
    }

    return scale
  },

  computeContentFitScaleForCamera: (
    distance: number,
    contentWidth: number,
    contentHeight: number,
    fit: 'cover' | 'contain' | 'vertical' | 'horizontal' = 'contain',
    camera = Engine.instance.camera as PerspectiveCamera
  ) => {
    const vFOV = MathUtils.degToRad(camera.fov)
    const targetHeight = Math.tan(vFOV / 2) * Math.abs(distance) * 2
    const targetWidth = targetHeight * camera.aspect

    return ObjectFitFunctions.computeContentFitScale(contentWidth, contentHeight, targetWidth, targetHeight, fit)
  }
}
