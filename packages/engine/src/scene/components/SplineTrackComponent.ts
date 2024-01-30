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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { useExecute } from '@etherealengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { getState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'
import { SplineComponent } from './SplineComponent'

const _euler = new Euler()
const _quat = new Quaternion()

const _point1Vector = new Vector3()

export const SplineTrackComponent = defineComponent({
  name: 'SplineTrackComponent',
  jsonID: 'spline-track',

  onInit: (entity) => {
    return {
      alpha: 0, // internal
      splineEntityUUID: null as EntityUUID | null,
      velocity: 1.0,
      enableRotation: false,
      lockToXZPlane: true,
      loop: true
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.splineEntityUUID !== 'undefined') component.splineEntityUUID.set(json.splineEntityUUID)
    if (typeof json.velocity === 'number') component.velocity.set(json.velocity)
    if (typeof json.enableRotation === 'boolean') component.enableRotation.set(json.enableRotation)
    if (typeof json.lockToXZPlane === 'boolean') component.lockToXZPlane.set(json.lockToXZPlane)
    if (typeof json.loop === 'boolean') component.loop.set(json.loop)
  },

  toJSON: (entity, component) => {
    return {
      splineEntityUUID: component.splineEntityUUID.value,
      velocity: component.velocity.value,
      enableRotation: component.enableRotation.value,
      lockToXZPlane: component.lockToXZPlane.value,
      loop: component.loop.value
    }
  },

  reactor: function (props) {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineTrackComponent)

    useExecute(
      () => {
        const { isEditor } = getState(EngineState)
        const { deltaSeconds } = getState(ECSState)
        if (isEditor) return
        if (!component.splineEntityUUID.value) return
        const splineTargetEntity = UUIDComponent.getEntityByUUID(component.splineEntityUUID.value)
        if (!splineTargetEntity) return

        const splineComponent = getOptionalComponent(splineTargetEntity, SplineComponent)
        if (!splineComponent) return

        // get local transform for this entity
        const transform = getOptionalComponent(entity, TransformComponent)
        if (!transform) return

        const elements = splineComponent.elements
        if (elements.length < 1) return

        if (Math.floor(component.alpha.value) > elements.length - 1) {
          if (!component.loop.value) {
            //emit an event here?
            return
          }
          component.alpha.set(0)
        }
        component.alpha.set(
          (alpha) => alpha + (deltaSeconds * component.velocity.value) / splineComponent.curve.getLength() // todo cache length to avoid recalculating every frame
        )

        // move along spline
        const alpha = component.alpha.value
        const index = Math.floor(component.alpha.value)
        const nextIndex = index + 1 > elements.length - 1 ? 0 : index + 1

        // prevent a possible loop around hiccup; if no loop then do not permit modulo 0
        if (!component.loop.value && index > nextIndex) return

        const splineTransform = getComponent(splineTargetEntity, TransformComponent)

        // translation
        splineComponent.curve.getPointAt(alpha - index, _point1Vector)
        transform.position.copy(_point1Vector)

        // rotation
        const q1 = elements[index].quaternion
        const q2 = elements[nextIndex].quaternion

        if (component.enableRotation.value) {
          if (component.lockToXZPlane.value) {
            // get X and Y rotation only
            _euler.setFromQuaternion(q1)
            _euler.z = 0

            transform.rotation.setFromEuler(_euler)

            _euler.setFromQuaternion(q2)
            _euler.z = 0

            _quat.setFromEuler(_euler)

            transform.rotation.fastSlerp(_quat, alpha - index)
          } else {
            transform.rotation.copy(q1).fastSlerp(q2, alpha - index)
          }
        }

        /** @todo optimize this */
        transform.matrix.compose(transform.position, transform.rotation, transform.scale)
        // apply spline transform
        transform.matrix.premultiply(splineTransform.matrix)
        transform.matrix.decompose(transform.position, transform.rotation, transform.scale)

        // update local transform for target
        const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
        if (!parentEntity) return
        const parentTransform = getComponent(parentEntity, TransformComponent)
        transform.matrix
          .premultiply(mat4.copy(parentTransform.matrixWorld).invert())
          .decompose(transform.position, transform.rotation, transform.scale)
      },
      { with: AnimationSystemGroup }
    )

    useEffect(() => {
      if (!component.splineEntityUUID.value) return
      const splineTargetEntity = UUIDComponent.getEntityByUUID(component.splineEntityUUID.value)
      if (!splineTargetEntity) return
      const splineComponent = getOptionalComponent(splineTargetEntity, SplineComponent)
      if (!splineComponent) return
      splineComponent.curve.closed = component.loop.value
    }, [component.loop])

    return null
  }
})

const mat4 = new Matrix4()
