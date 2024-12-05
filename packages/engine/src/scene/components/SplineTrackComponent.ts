/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { PhysicsSystem } from '@ir-engine/spatial/src/physics/systems/PhysicsSystem'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { SplineComponent } from './SplineComponent'

const _euler = new Euler()
const _quat = new Quaternion()

const _point1Vector = new Vector3()

export const SplineTrackComponent = defineComponent({
  name: 'SplineTrackComponent',
  jsonID: 'EE_spline_track',

  schema: S.Object({
    splineEntityUUID: T.EntityUUID(),
    velocity: S.Number(1.0),
    enableRotation: S.Bool(false),
    lockToXZPlane: S.Bool(true),
    loop: S.Bool(true),

    // internal
    alpha: S.NonSerialized(S.Number(0))
  }),

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
        const q1 = elements[index].rotation
        const q2 = elements[nextIndex].rotation

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
      { before: PhysicsSystem }
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
