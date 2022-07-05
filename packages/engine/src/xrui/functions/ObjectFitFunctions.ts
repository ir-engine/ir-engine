import type { WebContainer3D } from '@etherealjs/web-layer/three'
import { MathUtils, Object3D, PerspectiveCamera, Vector3 } from 'three'

import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { HALF_PI } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
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
    const vFOV = camera.fov * MathUtils.DEG2RAD
    const targetHeight = Math.tan(vFOV / 2) * Math.abs(distance) * 2
    const targetWidth = targetHeight * camera.aspect
    return ObjectFitFunctions.computeContentFitScale(contentWidth, contentHeight, targetWidth, targetHeight, fit)
  },

  attachObjectInFrontOfCamera: (obj: Object3D, scale: number, distance: number) => {
    obj.scale.x = obj.scale.y = scale
    obj.position.z = -distance
    // obj.rotation.z = 0
    // obj.rotation.y = 0
    if (obj.parent !== Engine.instance.currentWorld.camera) {
      obj.removeFromParent()
      Engine.instance.currentWorld.camera.add(obj)
    }
  },

  attachObjectToHand: (container: WebContainer3D, scale: number) => {
    const userEntity = Engine.instance.currentWorld.localClientEntity
    const avatarAnimationComponent = getComponent(userEntity, AvatarAnimationComponent)
    if (avatarAnimationComponent && avatarAnimationComponent.rig.LeftHand) {
      // todo: figure out how to scale this properly
      // container.scale.x = container.scale.y = 0.5 * scale
      // todo: use handedness option to settings
      if (container.parent !== Engine.instance.currentWorld.scene) {
        container.removeFromParent()
        Engine.instance.currentWorld.scene.add(container)
      }
      avatarAnimationComponent.rig.LeftHand.getWorldPosition(container.position)
      // container.position.z = 0.1
      container.updateMatrixWorld(true)
      // container.rotation.z = HALF_PI
      // container.rotation.y = HALF_PI
    }
  },

  attachObjectToPreferredTransform: (container: WebContainer3D, distance = 0.1, scale?: number) => {
    const fitScale =
      scale ??
      ObjectFitFunctions.computeContentFitScaleForCamera(
        distance,
        container.rootLayer.domSize.x,
        container.rootLayer.domSize.y
      )
    if (getEngineState().xrSessionStarted.value) {
      ObjectFitFunctions.attachObjectToHand(container, 10)
    } else {
      ObjectFitFunctions.attachObjectInFrontOfCamera(container, fitScale, distance)
    }
  },

  setUIVisible: (container: WebContainer3D, visibility: boolean) => {
    container.rootLayer.traverse((obj) => {
      obj.visible = visibility
    })
  }
}
