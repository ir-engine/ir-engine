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

import {
  AnimationSystemGroup,
  ECSState,
  UndefinedEntity,
  defineComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useExecute,
  useOptionalComponent
} from '@ir-engine/ecs'
import { getState, useImmediateEffect } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { Vector3_One, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { Transition, TransitionData } from '../classes/Transition'

export interface SizeMode {
  x: 'proportional' | 'literal'
  y: 'proportional' | 'literal'
  z: 'proportional' | 'literal'
}

const _size = new Vector3()

export const LayoutComponent = defineComponent({
  name: 'LayoutComponent',

  onInit: () => {
    return {
      /** The absolute position of the element relative to the anchor. */
      position: null as Vector3 | null,
      /** Transition data for smooth position changes. */
      positionTransition: Transition.defineVector3Transition(),
      /** Effective position after considering defaults. */
      effectivePosition: new Vector3(),

      /** The origin point for positioning within the anchor. (0,0,0) is top-left-front, (1,1,1) is bottom-right-back. */
      positionOrigin: null as Vector3 | null,
      /** Transition data for smooth position origin changes. */
      positionOriginTransition: Transition.defineVector3Transition(),
      /** Effective position origin after considering defaults. */
      effectivePositionOrigin: new Vector3(),

      /** The alignment point of the element itself. (0,0,0) aligns top-left-front, (0.5,0.5,0.5) centers the element. */
      alignmentOrigin: null as Vector3 | null,
      /** Transition data for smooth alignment origin changes. */
      alignmentTransition: Transition.defineVector3Transition(),
      /** Effective alignment origin after considering defaults. */
      effectiveAlignmentOrigin: new Vector3(),

      /** The rotation of the element. */
      rotation: null as Quaternion | null,
      /** Transition data for smooth rotation changes. */
      rotationTransition: Transition.defineQuaternionTransition(),
      /** Effective rotation after considering defaults. */
      effectiveRotation: new Quaternion(),

      /** The point around which the element rotates. (0,0,0) is element's top-left-front, (0.5,0.5,0.5) is center. */
      rotationOrigin: null as Vector3 | null,
      /** Transition data for smooth rotation origin changes. */
      rotationOriginTransition: Transition.defineVector3Transition(),
      /** Effective rotation origin after considering defaults. */
      effectiveRotationOrigin: new Vector3(),

      /** The dimensions of the element. Can be absolute or proportional based on sizeMode. */
      size: null as Vector3 | null,
      /** Transition data for smooth size changes. */
      sizeTransition: Transition.defineVector3Transition(),
      /** Effective size after considering defaults. */
      effectiveSize: new Vector3(),

      /** Determines how size is interpreted for each axis: 'proportional' or 'literal'. */
      sizeMode: null as SizeMode | null,
      /** Effective size mode after considering defaults. */
      effectiveSizeMode: { x: 'literal', y: 'literal', z: 'literal' } as SizeMode,

      /** Default values for all properties. Used when the corresponding property is null. */
      defaults: {
        position: new Vector3(),
        positionOrigin: new Vector3(),
        alignmentOrigin: new Vector3(),
        rotation: new Quaternion(),
        rotationOrigin: new Vector3(),
        size: new Vector3(),
        sizeMode: { x: 'literal', y: 'literal', z: 'literal' } as SizeMode
      },

      /** The entity that anchors this layout. */
      anchorEntity: UndefinedEntity,

      contentEntity: UndefinedEntity
    }
  },

  onSet: (entity, component, json) => {
    if (json?.position) component.position.set(new Vector3().copy(json.position))
    if (json?.positionOrigin) component.positionOrigin.set(new Vector3().copy(json.positionOrigin))
    if (json?.alignmentOrigin) component.alignmentOrigin.set(new Vector3().copy(json.alignmentOrigin))
    if (json?.rotation) component.rotation.set(new Quaternion().copy(json.rotation))
    if (json?.rotationOrigin) component.rotationOrigin.set(new Vector3().copy(json.rotationOrigin))
    if (json?.size) component.size.set(new Vector3().copy(json.size))
    if (json?.sizeMode) component.sizeMode.set(json.sizeMode)

    if (json?.position == null) component.position.set(null)
    if (json?.positionOrigin == null) component.positionOrigin.set(null)
    if (json?.alignmentOrigin == null) component.alignmentOrigin.set(null)
    if (json?.rotation == null) component.rotation.set(null)
    if (json?.rotationOrigin == null) component.rotationOrigin.set(null)
    if (json?.size == null) component.size.set(null)
    if (json?.sizeMode == null) component.sizeMode.set(null)

    if (json?.defaults) {
      if (json.defaults.position) component.defaults.position.set(new Vector3().copy(json.defaults.position))
      if (json.defaults.positionOrigin)
        component.defaults.positionOrigin.set(new Vector3().copy(json.defaults.positionOrigin))
      if (json.defaults.alignmentOrigin)
        component.defaults.alignmentOrigin.set(new Vector3().copy(json.defaults.alignmentOrigin))
      if (json.defaults.rotation) component.defaults.rotation.set(new Quaternion().copy(json.defaults.rotation))
      if (json.defaults.rotationOrigin)
        component.defaults.rotationOrigin.set(new Vector3().copy(json.defaults.rotationOrigin))
      if (json.defaults.size) component.defaults.size.set(new Vector3().copy(json.defaults.size))
      if (json.defaults.sizeMode) component.defaults.sizeMode.set(json.defaults.sizeMode)
    }

    if (json?.anchorEntity) component.anchorEntity.set(json.anchorEntity)
  },

  toJSON: (component) => {
    return component
  },

  reactor: () => {
    const entity = useEntityContext()
    const layout = useComponent(entity, LayoutComponent)

    // This layout might be anchored to another layout, or an object with a bounding box, or a camera.
    const anchorEntity = layout.anchorEntity.value
    const anchorLayout = useOptionalComponent(anchorEntity, LayoutComponent)
    const anchorCamera = useOptionalComponent(anchorEntity, CameraComponent)
    const anchorBounds = useOptionalComponent(anchorEntity, BoundingBoxComponent)

    // Compute effective properties
    useImmediateEffect(() => {
      if (!layout) return
      const defaults = layout.defaults.value
      layout.effectivePosition.value.copy(new Vector3().copy(layout.position.value ?? defaults.position))
      layout.effectivePositionOrigin.set(new Vector3().copy(layout.positionOrigin.value ?? defaults.positionOrigin))
      layout.effectiveAlignmentOrigin.set(new Vector3().copy(layout.alignmentOrigin.value ?? defaults.alignmentOrigin))
      layout.effectiveRotation.set(new Quaternion().copy(layout.rotation.value ?? defaults.rotation))
      layout.effectiveRotationOrigin.set(new Vector3().copy(layout.rotationOrigin.value ?? defaults.rotationOrigin))
      layout.effectiveSizeMode.set({ ...(layout.sizeMode.value ?? defaults.sizeMode) })
      layout.effectiveSize.set(new Vector3().copy(layout.size.value ?? defaults.size))
    }, [
      layout.position,
      layout.size,
      layout.sizeMode,
      layout.positionOrigin,
      layout.alignmentOrigin,
      layout.rotation,
      layout.rotationOrigin,
      layout.defaults
    ])

    // apply new target to transitions when effective properties change
    useImmediateEffect(() => {
      if (!layout) return
      const simulationTime = getState(ECSState).simulationTime
      Transition.applyNewTarget(layout.effectivePosition.value, simulationTime, layout.positionTransition)
      Transition.applyNewTarget(layout.effectivePositionOrigin.value, simulationTime, layout.positionOriginTransition)
      Transition.applyNewTarget(layout.effectiveAlignmentOrigin.value, simulationTime, layout.alignmentTransition)
      Transition.applyNewTarget(layout.effectiveRotation.value, simulationTime, layout.rotationTransition)
      Transition.applyNewTarget(layout.effectiveRotationOrigin.value, simulationTime, layout.rotationOriginTransition)
      Transition.applyNewTarget(layout.effectiveSize, simulationTime, layout.sizeTransition)
    }, [
      layout?.positionTransition,
      layout?.positionOriginTransition,
      layout?.alignmentTransition,
      layout?.rotationTransition,
      layout?.rotationOriginTransition
    ])

    // Reusable objects for calculations
    const finalPosition = new Vector3()
    const rotationOriginOffset = new Vector3()
    const matrix = new Matrix4()
    const tempMatrix = new Matrix4()
    const finalRotation = new Quaternion()
    const finalScale = new Vector3()

    // Update transitions every frame
    useExecute(
      () => {
        if (!layout) return
        const frameTime = getState(ECSState).frameTime

        Transition.computeCurrentValue(frameTime, layout.positionTransition.value as TransitionData<Vector3>)
        Transition.computeCurrentValue(frameTime, layout.positionOriginTransition.value as TransitionData<Vector3>)
        Transition.computeCurrentValue(frameTime, layout.alignmentTransition.value as TransitionData<Vector3>)
        Transition.computeCurrentValue(frameTime, layout.rotationTransition.value as TransitionData<Quaternion>)
        Transition.computeCurrentValue(frameTime, layout.rotationOriginTransition.value as TransitionData<Vector3>)
        // The current values are now stored in the TransitionData.current property
        const position = layout.positionTransition.value.current
        const positionOrigin = layout.positionOriginTransition.value.current
        const alignmentOrigin = layout.alignmentTransition.value.current
        const rotation = layout.rotationTransition.value.current
        const rotationOrigin = layout.rotationOriginTransition.value.current
        const size = layout.effectiveSize.value

        // Compute the final position
        let anchorSize = Vector3_Zero

        if (anchorLayout?.ornull?.effectiveSize.value) {
          anchorSize = anchorLayout.effectiveSize.value
        } else if (anchorCamera?.value) {
          // depends on frustum position
        } else if (anchorBounds?.box) {
          anchorSize = anchorBounds.box.value.getSize(_size)
        }

        finalPosition.set(
          position.x + positionOrigin.x * anchorSize.x - alignmentOrigin.x * size.x,
          position.y + positionOrigin.y * anchorSize.y - alignmentOrigin.y * size.y,
          position.z + positionOrigin.z * anchorSize.z - alignmentOrigin.z * size.z
        )

        // Apply rotation origin offset
        rotationOriginOffset.set(
          (rotationOrigin.x - 0.5) * size.x,
          (rotationOrigin.y - 0.5) * size.y,
          (rotationOrigin.z - 0.5) * size.z
        )

        // Create a matrix to combine rotation and position
        matrix.compose(finalPosition, rotation, Vector3_One)

        // Apply rotation origin offset
        tempMatrix.makeTranslation(rotationOriginOffset.x, rotationOriginOffset.y, rotationOriginOffset.z)
        matrix.multiply(tempMatrix)
        tempMatrix.makeRotationFromQuaternion(rotation)
        matrix.multiply(tempMatrix)
        tempMatrix.makeTranslation(-rotationOriginOffset.x, -rotationOriginOffset.y, -rotationOriginOffset.z)
        matrix.multiply(tempMatrix)

        // Extract final position and rotation from the matrix
        matrix.decompose(finalPosition, finalRotation, finalScale)

        // Update the transform component
        setComponent(entity, TransformComponent, {
          position: finalPosition,
          rotation: finalRotation,
          scale: size
        })
      },
      {
        with: AnimationSystemGroup
      }
    )

    return null
  }
})
