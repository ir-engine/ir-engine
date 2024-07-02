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

import {
  Engine,
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { TweenComponent } from '@etherealengine/spatial/src/transform/components/TweenComponent'
import { Easing, Tween } from '@tweenjs/tween.js'
import { useEffect } from 'react'
import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
import { AvatarComponent } from './avatar/components/AvatarComponent'

export const CameraTriggerComponent = defineComponent({
  name: 'CameraTriggerComponent',
  jsonID: 'EE_camera_trigger',

  onInit(entity) {
    return {
      lookAtEntityUUID: null as EntityUUID | null,
      offset: new Vector3(),
      theta: 0,
      phi: 0,
      distance: 10,
      enterLerpDuration: 0,
      hideAvatar: false
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.lookAtEntityUUID !== 'undefined') component.lookAtEntityUUID.set(json.lookAtEntityUUID)
    if (typeof json.offset !== 'undefined') component.offset.set(json.offset)
    if (typeof json.theta !== 'undefined') component.theta.set(json.theta)
    if (typeof json.phi !== 'undefined') component.phi.set(json.phi)
    if (typeof json.distance !== 'undefined') component.distance.set(json.distance)
    if (typeof json.enterLerpDuration !== 'undefined') component.enterLerpDuration.set(json.enterLerpDuration)
    if (typeof json.hideAvatar !== 'undefined') component.hideAvatar.set(json.hideAvatar)
  },

  toJSON(entity, component) {
    return {
      lookAtEntityUUID: component.lookAtEntityUUID.value,
      offset: component.offset.value,
      theta: component.theta.value,
      phi: component.phi.value,
      distance: component.distance.value,
      enterLerpDuration: component.enterLerpDuration.value,
      hideAvatar: component.hideAvatar.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraTriggerComponent)
    const followEntity = Engine.instance.viewerEntity
    const follow = useComponent(followEntity, FollowCameraComponent)
    const cameraTransform = getComponent(followEntity, TransformComponent)
    const avatarTransform = getComponent(AvatarComponent.getSelfAvatarEntity(), TransformComponent)

    let prevCameraPostion = new Vector3()
    let prevCamearRotation = new Quaternion()

    const tween = createTween({ value: 0.0001 })
    const upVector = new Vector3(0, 1, 0)
    const empty = new Vector3()
    const direction = new Vector3()
    const mx = new Matrix4()

    useEffect(() => {
      const Enter = () => {
        const lookAtEnity = UUIDComponent.getEntityByUUID(component.lookAtEntityUUID.value as EntityUUID)
        const lookAtEnityTransform = getComponent(lookAtEnity, TransformComponent)

        prevCameraPostion = new Vector3(
          cameraTransform.position.x,
          cameraTransform.position.y,
          cameraTransform.position.z
        )

        prevCamearRotation = cameraTransform.rotation

        follow.enabled.set(false)

        const theta = component.theta.value
        const thetaRad = MathUtils.degToRad(theta)
        const phiRad = MathUtils.degToRad(component.phi.value)

        const startLookAtPosition = follow.currentTargetPosition.value
        const endLookAtPosition = lookAtEnityTransform.position.clone()

        const startPositon = cameraTransform.position
        const targetPosition = new Vector3()
        targetPosition
          .copy(component.offset.value)
          .applyQuaternion(TransformComponent.getWorldRotation(lookAtEnity, lookAtEnityTransform.rotation))
          .add(TransformComponent.getWorldPosition(lookAtEnity, new Vector3()))
        const endPosition = new Vector3(
          targetPosition.x + component.distance.value * Math.sin(thetaRad) * Math.cos(phiRad),
          targetPosition.y + component.distance.value * Math.sin(phiRad),
          targetPosition.z + component.distance.value * Math.cos(thetaRad) * Math.cos(phiRad)
        )

        tween
          .stop()
          .to({ value: 1 }, 1000 * component.enterLerpDuration.value)
          .onUpdate(({ value }) => {
            const currentPosition = startPositon.lerp(endPosition, value)
            cameraTransform.position.set(currentPosition.x, currentPosition.y, currentPosition.z)
            const currentLookAtPosition = startLookAtPosition.lerp(endLookAtPosition, value)
            direction.copy(cameraTransform.position).sub(currentLookAtPosition).normalize()
            mx.lookAt(direction, empty, upVector)
            cameraTransform.rotation.setFromRotationMatrix(mx)
          })
          .onComplete(() => {
            if (component.hideAvatar.value) {
              removeComponent(AvatarComponent.getSelfAvatarEntity(), VisibleComponent)
            }
          })
          .easing(Easing.Exponential.InOut)
          .start()
      }

      const Exit = () => {
        if (!hasComponent(AvatarComponent.getSelfAvatarEntity(), VisibleComponent)) {
          setComponent(AvatarComponent.getSelfAvatarEntity(), VisibleComponent)
        }
        const avatarEntity = AvatarComponent.getSelfAvatarEntity()
        follow.targetEntity.set(avatarEntity)
        follow.enabled.set(true)
      }

      setCallback(entity, 'onCameraTriggerEnter', (triggerEntity: Entity, otherEntity: Entity) => {
        Enter()
      })
      setCallback(entity, 'onCameraTriggerExit', (triggerEntity: Entity, otherEntity: Entity) => {
        Exit()
      })

      const triggerComp = getMutableComponent(entity, TriggerComponent)
      triggerComp.triggers.merge([
        {
          onEnter: 'onCameraTriggerEnter',
          onExit: 'onCameraTriggerExit',
          target: '' as EntityUUID
        }
      ])
    }, [])

    return null
  }
})

function createTween<T extends Record<string, any>>(obj: T) {
  const entity = createEntity()
  const tween = setComponent(entity, TweenComponent, new Tween<T>(obj))

  Object.assign(tween, {
    destroy: () => {
      tween.stop()
      removeEntity(entity)
    }
  })

  return tween as Tween<T> & { destroy: () => void }
}
