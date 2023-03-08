import { Matrix4, Object3D, PerspectiveCamera, Quaternion, Vector2, Vector3 } from 'three'

import { getMutableState } from '@etherealengine/hyperflux'
import type { WebContainer3D } from '@etherealengine/xrui'

import { AvatarAnimationComponent, AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { Object3DUtils } from '../../common/functions/Object3DUtils'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'

const _size = new Vector2()
const _vec = new Vector3()
const _pos = new Vector3()
const _quat = new Quaternion()
const _forward = new Vector3(0, 0, -1)
const _mat4 = new Matrix4()
const _vec3 = new Vector3()

export type ContentFitType = 'cover' | 'contain' | 'vertical' | 'horizontal'

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
    fit: ContentFitType = 'contain'
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

  computeFrustumSizeAtDistance: (distance: number, camera = Engine.instance.camera as PerspectiveCamera) => {
    // const vFOV = camera.fov * DEG2RAD
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
    const inverseProjection = camera.projectionMatrixInverse
    const topRadians = _vec.set(0, 1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const bottomRadians = _vec.set(0, -1, -1).applyMatrix4(inverseProjection).angleTo(_forward)
    const vFOV = topRadians + bottomRadians
    const height = Math.tan(vFOV / 2) * Math.abs(distance) * 2
    const width = height * camera.aspect
    return _size.set(width, height)
  },

  computeContentFitScaleForCamera: (
    distance: number,
    contentWidth: number,
    contentHeight: number,
    fit: ContentFitType = 'contain',
    camera = Engine.instance.camera as PerspectiveCamera
  ) => {
    const size = ObjectFitFunctions.computeFrustumSizeAtDistance(distance, camera)
    return ObjectFitFunctions.computeContentFitScale(contentWidth, contentHeight, size.width, size.height, fit)
  },

  attachObjectInFrontOfCamera: (entity: Entity, scale: number, distance: number) => {
    const transform = getComponent(entity, TransformComponent)
    _mat4.makeTranslation(0, 0, -distance).scale(_vec3.set(scale, scale, 1))
    transform.matrix.multiplyMatrices(Engine.instance.camera.matrixWorld, _mat4)
    transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
    transform.matrixInverse.copy(transform.matrix).invert()
    Engine.instance.dirtyTransforms[entity] = false
  },

  attachObjectToHand: (container: WebContainer3D, scale: number) => {
    const { localClientEntity } = Engine.instance
    const avatarAnimationComponent = getComponent(localClientEntity, AvatarRigComponent)
    if (avatarAnimationComponent && avatarAnimationComponent.rig.LeftHand) {
      // todo: figure out how to scale this properly
      // container.scale.x = container.scale.y = 0.5 * scale
      // todo: use handedness option to settings
      if (container.parent !== Engine.instance.scene) {
        container.removeFromParent()
        Engine.instance.scene.add(container)
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

  lookAtCameraFromPosition: (container: WebContainer3D, position: Vector3) => {
    container.scale.setScalar(Math.max(1, Engine.instance.camera.position.distanceTo(position) / 3))
    container.position.copy(position)
    container.rotation.setFromRotationMatrix(Engine.instance.camera.matrixWorld)
  }
}
