import type { WebContainer3D } from '@etherealjs/web-layer/three'
import { Object3D, PerspectiveCamera, Quaternion, Vector3 } from 'three'
import { DEG2RAD } from 'three/src/math/MathUtils'

import { getState } from '@xrengine/hyperflux'

import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { Object3DUtils } from '../../common/functions/Object3DUtils'
import { Engine } from '../../ecs/classes/Engine'
import { Component, getComponent } from '../../ecs/functions/ComponentFunctions'
import { XRState } from '../../xr/XRState'
import { XRUIComponentType } from '../components/XRUIComponent'
import { XRUI } from './createXRUI'

const _vec = new Vector3()
const _pos = new Vector3()
const _quat = new Quaternion()
const _forward = new Vector3(0, 0, -1)

// yes, multiple by the same direction twice, as the local coordinate changes with each rotation
const _handRotation = new Quaternion()
  .setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI))
  .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2))

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
    // const vFOV = camera.fov * DEG2RAD
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
    const inverseProjection = camera.projectionMatrixInverse
    const topRadians = _vec.set(0, 1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const bottomRadians = _vec.set(0, -1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const vFOV = topRadians + bottomRadians
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
    const { localClientEntity } = Engine.instance.currentWorld
    const avatarAnimationComponent = getComponent(localClientEntity, AvatarAnimationComponent)
    if (avatarAnimationComponent && avatarAnimationComponent.rig.LeftHand) {
      // todo: figure out how to scale this properly
      // container.scale.x = container.scale.y = 0.5 * scale
      // todo: use handedness option to settings
      if (container.parent !== Engine.instance.currentWorld.scene) {
        container.removeFromParent()
        Engine.instance.currentWorld.scene.add(container)
      }

      _pos.copy(avatarAnimationComponent.rig.LeftHand.position)
      _pos.x -= 0.1
      _pos.y -= 0.1
      container.position.copy(avatarAnimationComponent.rig.LeftHand.localToWorld(_pos))
      container.quaternion
        .set(0, 0, 0, 1)
        .multiply(Object3DUtils.getWorldQuaternion(avatarAnimationComponent.rig.LeftHand, _quat))
        .multiply(_handRotation)
      container.updateMatrixWorld(true)
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
    const xrState = getState(XRState)
    if (xrState.sessionActive.value) {
      ObjectFitFunctions.attachObjectToHand(container, 10)
    } else {
      ObjectFitFunctions.attachObjectInFrontOfCamera(container, fitScale, distance)
    }
  },

  lookAtCameraFromPosition: (container: WebContainer3D, position: Vector3) => {
    container.scale.setScalar(Math.max(1, Engine.instance.currentWorld.camera.position.distanceTo(position) / 3))
    container.position.copy(position)
    container.rotation.setFromRotationMatrix(Engine.instance.currentWorld.camera.matrixWorld)
  }
}
