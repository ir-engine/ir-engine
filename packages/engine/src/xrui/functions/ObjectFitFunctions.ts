import type { WebContainer3D } from '@etherealjs/web-layer/three'
import { MathUtils, PerspectiveCamera } from 'three'

import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { HALF_PI } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'

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
    camera = Engine.instance.currentWorld.camera as PerspectiveCamera
  ) => {
    const vFOV = MathUtils.degToRad(camera.fov)
    const targetHeight = Math.tan(vFOV / 2) * Math.abs(distance) * 2
    const targetWidth = targetHeight * camera.aspect

    return ObjectFitFunctions.computeContentFitScale(contentWidth, contentHeight, targetWidth, targetHeight, fit)
  },

  attachObjectInFrontOfCamera: (container: WebContainer3D, scale: number, distance: number) => {
    container.scale.x = container.scale.y = scale * 1.1
    container.position.z = -distance
    container.parent = Engine.instance.currentWorld.camera
  },

  attachObjectToHand: (container: WebContainer3D, scale: number, distance: number) => {
    const userEntity = Engine.instance.currentWorld.localClientEntity
    const avatarAnimationComponent = getComponent(userEntity, AvatarAnimationComponent)
    if (avatarAnimationComponent) {
      // todo: figure out how to scale this properly
      container.scale.x = container.scale.y = 0.5
      // todo: use handedness option to settings
      container.parent = avatarAnimationComponent.rig.LeftHand
      // container.position.z = 0.1
      container.updateMatrixWorld(true)
      container.rotation.z = HALF_PI
      container.rotation.y = HALF_PI
    }
  },

  attachObjectToPreferredTransform: (
    container: WebContainer3D,
    objectWidth: number,
    objectHeight: number,
    distance = 0.1,
    scaleToView = 1
  ) => {
    const ppu = container.options.manager.pixelsPerMeter
    const contentWidth = objectWidth / ppu
    const contentHeight = objectHeight / ppu

    const scale =
      ObjectFitFunctions.computeContentFitScaleForCamera(distance, contentWidth, contentHeight, 'cover') * scaleToView

    ObjectFitFunctions.attachObjectInFrontOfCamera(container, scale, distance)
  },

  changeVisibilityOfRootLayer: (container: WebContainer3D, visibility: boolean) => {
    container.rootLayer.visibility = visibility
  }
}
