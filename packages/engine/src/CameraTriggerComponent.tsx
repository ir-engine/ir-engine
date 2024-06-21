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
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { NO_PROXY, useState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { setCallback } from '@etherealengine/spatial/src/common/CallbackComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import { AvatarComponent } from './avatar/components/AvatarComponent'

export const CameraTriggerComponent = defineComponent({
  name: 'CameraTriggerComponent',
  jsonID: 'EE_camera_trigger',

  onInit(entity) {
    return {
      lookAtEntityUUID: null as EntityUUID | null,
      offset: new Vector3(),
      lockCamera: false,
      theta: 0,
      phi: 0,
      distance: 10
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.lookAtEntityUUID !== 'undefined') component.lookAtEntityUUID.set(json.lookAtEntityUUID)
    if (typeof json.offset !== 'undefined') component.offset.set(json.offset)
    if (typeof json.lockCamera !== 'undefined') component.lockCamera.set(json.lockCamera)
    if (typeof json.theta !== 'undefined') component.theta.set(json.theta)
    if (typeof json.phi !== 'undefined') component.phi.set(json.phi)
    if (typeof json.distance !== 'undefined') component.distance.set(json.distance)
  },

  toJSON(entity, component) {
    return {
      lookAtEntityUUID: component.lookAtEntityUUID.value,
      offset: component.offset.value,
      lockCamera: component.lockCamera.value,
      theta: component.theta.value,
      phi: component.phi.value,
      distance: component.distance.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, CameraTriggerComponent)
    const follow = useComponent(Engine.instance.viewerEntity, FollowCameraComponent)
    let prevOffset = useState(new Vector3())
    let prevLockCamera = useState(false)
    let prevTheta = useState(0)
    let prevPhi = useState(0)
    let prevDistance = useState(0)

    useEffect(() => {
      const Enter = () => {
        console.log('Enter \n ' + component.lookAtEntityUUID.value + '\n' + component.offset.value)
        const lookAtEnity = UUIDComponent.getEntityByUUID(component.lookAtEntityUUID.value as EntityUUID)
        const lookAtEnityTransform = getComponent(lookAtEnity, TransformComponent)

        prevOffset.set(follow.offset.value)
        prevLockCamera.set(follow.locked.value)
        prevTheta.set(follow.theta.value)
        prevPhi.set(follow.phi.value)
        prevDistance.set(follow.distance.value)

        follow.distance.set(component.distance.value)
        follow.offset.set(component.offset.get(NO_PROXY) as Vector3)
        follow.targetEntity.set(lookAtEnity)

        follow.locked.set(component.lockCamera.value)
        if (component.lockCamera.value) {
          follow.theta.set(component.theta.value)
          follow.phi.set(component.phi.value)
        }
      }

      const Exit = () => {
        console.log('Exit')
        follow.targetEntity.set(AvatarComponent.getSelfAvatarEntity())
        follow.offset.set(prevOffset.value)
        follow.distance.set(prevDistance.value)

        if (follow.locked.value) {
          follow.theta.set(prevTheta.value)
          follow.phi.set(prevPhi.value)
        }
        follow.locked.set(prevLockCamera.value)
      }

      setCallback(entity, 'onEnter', (triggerEntity: Entity, otherEntity: Entity) => {
        Enter()
      })
      setCallback(entity, 'onExit', (triggerEntity: Entity, otherEntity: Entity) => {
        Exit()
      })

      if (!hasComponent(entity, TriggerComponent)) {
        setComponent(entity, TriggerComponent)
      }

      const triggerComp = getMutableComponent(entity, TriggerComponent)
      triggerComp.triggers.merge([
        {
          onEnter: 'onEnter',
          onExit: 'onExit',
          target: '' as EntityUUID
        }
      ])
    }, [])

    return null
  }
})
