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
  ECSState,
  Entity,
  Static,
  UndefinedEntity,
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { CreateSchemaValue } from '@ir-engine/ecs/src/schemas/JSONSchemaUtils'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { State, getState, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Vector3_One, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { useChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { ArrayCamera, Box3, Matrix4, Quaternion, Vector3 } from 'three'
import { Transition } from '../classes/Transition'

export enum SizeMode {
  proportional = 'proportional',
  literal = 'literal'
}

export enum ContentFit {
  contain = 'contain',
  cover = 'cover',
  fill = 'fill',
  none = 'none',
  scaleDown = 'scale-down'
}

const _size = new Vector3()

export const UnitNormalizedSchema = S.Object({
  millimeters: S.Number(0),
  pixels: S.Number(0),
  percent: S.Number(0)
})

export const UnitSchema = S.Union([UnitNormalizedSchema, S.String(), S.Number()], 0)

export const Unit3NormalizedSchema = S.Object({
  x: UnitNormalizedSchema,
  y: UnitNormalizedSchema,
  z: UnitNormalizedSchema
})

/**
 * Similar to CSS positioning, positive values correspond to right, down, and forward.
 */
export const defineUnit3 = (init?: {
  x: Static<typeof UnitSchema>
  y: Static<typeof UnitSchema>
  z: Static<typeof UnitSchema>
}) =>
  S.Object(
    {
      x: UnitSchema,
      y: UnitSchema,
      z: UnitSchema
    },
    init,
    { id: 'Unit3' }
  )

function defineUnit3Transition() {
  return Transition.defineTransition<Static<typeof Unit3NormalizedSchema>>({
    buffer: [
      {
        timestamp: 0,
        value: {
          x: { millimeters: 0, pixels: 0, percent: 0 },
          y: { millimeters: 0, pixels: 0, percent: 0 },
          z: { millimeters: 0, pixels: 0, percent: 0 }
        }
      }
    ],
    interpolationFunction: (a, b, t) => ({
      x: {
        millimeters: a.x.millimeters + (b.x.millimeters - a.x.millimeters) * t,
        pixels: a.x.pixels + (b.x.pixels - a.x.pixels) * t,
        percent: a.x.percent + (b.x.percent - a.x.percent) * t
      },
      y: {
        millimeters: a.y.millimeters + (b.y.millimeters - a.y.millimeters) * t,
        pixels: a.y.pixels + (b.y.pixels - a.y.pixels) * t,
        percent: a.y.percent + (b.y.percent - a.y.percent) * t
      },
      z: {
        millimeters: a.z.millimeters + (b.z.millimeters - a.z.millimeters) * t,
        pixels: a.z.pixels + (b.z.pixels - a.z.pixels) * t,
        percent: a.z.percent + (b.z.percent - a.z.percent) * t
      }
    })
  })
}

export const LayoutComponent = defineComponent({
  name: 'LayoutComponent',

  schema: S.Object({
    /**
     * Position the origin of this entity relative to the container entity.
     *
     * Similar to CSS positioning, positive values correspond to right, down, and forward.
     *
     * Default is { x: "0", y: "0", z: "0" } (top-left-back corner).
     *
     * Complex unit combinations can be used, e.g.:
     *
     * {x: "100% - 10px", y: "50mm", z: "0"}
     */
    position: S.Optional(defineUnit3()),
    positionTransition: defineUnit3Transition(),

    /**
     * Position the origin of this entity relative to itself.
     *
     * Similar to CSS positioning, positive values correspond to right, down, and forward.
     *
     * Default is { x: "0", y: "0", z: "0" }  (top-lef-back corner)
     *
     * Complex unit combinations can be used, e.g.:
     *
     * {x: "0", y: "50% + 10mm", z: "0"}
     */
    origin: S.Optional(defineUnit3()),
    originTransition: defineUnit3Transition(),

    /**
     * Rotation of the entity in quaternion form, about the rotation origin.
     */
    rotation: S.Optional(S.Quaternion()),
    rotationTransition: Transition.defineQuaternionTransition(),

    /**
     * Position the rotation origin of this entity relative to itself.
     *
     * Similar to CSS positioning, positive values correspond to right, down, and forward.
     *
     * Default is { x: "50%", y: "50%", z: "50%" }  (center)
     *
     * Complex unit combinations can be used, e.g.:
     *
     * {x: "50%", y: "50% + 10mm", z: "50%"}
     */
    rotationOrigin: S.Optional(defineUnit3()),
    rotationOriginTransition: defineUnit3Transition(),

    /**
     * Set the size of the entity.
     *
     * Default is { x: "100%", y: "100%", z: "100%" } (match container size).
     *
     * Complex unit combinations can be used, e.g.:
     *
     * {x: "100% + 10mm", y: "100%", z: "100%"}
     */
    size: S.Optional(defineUnit3()),
    sizeTransition: defineUnit3Transition(),

    /**
     * Content fit mode for the entity. Options include:
     * - contain: Scale the content to fit within the container.
     * - cover: Scale the content to cover the container.
     * - fill: Stretch the content to fill the container.
     * - none: Do not scale the content.
     * - scaleDown: Scale the content down if necessary.
     *
     * Default is ContentFit.contain.
     */
    contentFit: S.Optional(S.Enum(ContentFit)),
    contentFitTransition: Transition.defineVector3Transition(),

    defaults: S.Object({
      position: defineUnit3(),
      origin: defineUnit3(),
      rotation: S.Quaternion(),
      rotationOrigin: defineUnit3({ x: '50%', y: '50%', z: '50%' }),
      size: defineUnit3({ x: '100%', y: '100%', z: '100%' }),
      contentFit: S.Enum(ContentFit, ContentFit.contain)
    }),

    containerEntity: S.Entity()
  }),

  getRootContainerEntity(entity: Entity) {
    const containerEntities = [] as Entity[]
    let layout = getOptionalComponent(entity, LayoutComponent)
    while (layout?.containerEntity && !containerEntities.includes(layout.containerEntity)) {
      containerEntities.push(layout.containerEntity)
      layout = getOptionalComponent(layout.containerEntity, LayoutComponent)
    }

    return containerEntities[containerEntities.length - 1]
  },

  reactor: () => {
    const entity = useEntityContext()
    const layout = useEffectiveLayout(entity)
    const containerEntity = layout.containerEntity.value

    const simulationTime = getState(ECSState).simulationTime
    Transition.useTransitionTarget(layout.positionTransition, layout.position, simulationTime)
    Transition.useTransitionTarget(layout.originTransition, layout.origin, simulationTime)
    Transition.useTransitionTarget(layout.rotationTransition, layout.rotation, simulationTime)
    Transition.useTransitionTarget(layout.rotationOriginTransition, layout.rotationOrigin, simulationTime)
    Transition.useTransitionTarget(layout.sizeTransition, layout.size, simulationTime)
    Transition.useTransitionTarget(layout.contentFitTransition, layout.contentFit, simulationTime)

    // Reusable objects for calculations
    const finalPosition = new Vector3()
    const rotationOriginOffset = new Vector3()
    const matrix = new Matrix4()
    const tempMatrix = new Matrix4()
    const finalRotation = new Quaternion()
    const finalScale = new Vector3()

    useImmediateEffect(() => {
      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [containerEntity],

        computeFunction: () => {
          const frameTime = getState(ECSState).frameTime

          // Update transitions
          const l = getComponent(entity, LayoutComponent)
          Transition.computeCurrentValue(frameTime, l.positionTransition)
          Transition.computeCurrentValue(frameTime, l.originTransition)
          Transition.computeCurrentValue(frameTime, l.rotationTransition)
          Transition.computeCurrentValue(frameTime, l.rotationOriginTransition)
          Transition.computeCurrentValue(frameTime, l.sizeTransition)
          Transition.computeCurrentValue(frameTime, l.contentFitTransition)

          // Get current values
          const position = l.positionTransition.current
          const origin = l.originTransition.current
          const rotation = l.rotationTransition.current
          const rotationOrigin = l.rotationOriginTransition.current
          const size = l.sizeTransition.current
          const contentFitScale = l.contentFitTransition.current

          // Compute the final position
          const finalPosition = new Vector3()
          let containerSize = Vector3_Zero

          if (containerCamera?.value && containerRenderer?.canvas.value) {
            // Handle camera container
            const canvas = containerRenderer.canvas.value
            const rect = canvas.getBoundingClientRect()

            // Screen-space position in pixels
            const screenPosition = new Vector3(
              position.x + positionOrigin.x * rect.width - alignmentOrigin.x * size.x,
              position.y + positionOrigin.y * rect.height - alignmentOrigin.y * size.y,
              0 // We'll set the depth separately
            )

            // Convert screen position to NDC (Normalized Device Coordinates)
            const ndc = new Vector3(
              (screenPosition.x / rect.width) * 2 - 1,
              -(screenPosition.y / rect.height) * 2 + 1,
              0 // NDC z-value (we'll set depth later)
            )

            // Set depth (z-coordinate in NDC space)
            // Assuming you want to place the entity at a specific distance from the camera
            // For example, at depth = -0.5 in NDC space corresponds to halfway between near and far planes
            const depth = position.z !== 0 ? position.z : -0.001 // Default depth
            ndc.z =
              -1 + 2 * ((depth - containerCamera.value.near) / (containerCamera.value.far - containerCamera.value.near))

            // Unproject NDC to world space
            ndc.unproject(containerCamera.value as ArrayCamera)

            finalPosition.copy(ndc)
          } else if (containerLayout?.ornull?.effectiveSize.value) {
            // Handle container layout
            containerSize = containerLayout.effectiveSize.value
            finalPosition.set(
              position.x + positionOrigin.x * containerSize.x - alignmentOrigin.x * size.x,
              position.y + positionOrigin.y * containerSize.y - alignmentOrigin.y * size.y,
              position.z + positionOrigin.z * containerSize.z - alignmentOrigin.z * size.z
            )
          } else if (containerBounds?.worldSpaceBox) {
            // Handle bounding box container
            containerSize = containerBounds.worldSpaceBox.value.getSize(_size)
            finalPosition.set(
              position.x + positionOrigin.x * containerSize.x - alignmentOrigin.x * size.x,
              position.y + positionOrigin.y * containerSize.y - alignmentOrigin.y * size.y,
              position.z + positionOrigin.z * containerSize.z - alignmentOrigin.z * size.z
            )
          } else {
            // Default case
            finalPosition.set(
              position.x - alignmentOrigin.x * size.x,
              position.y - alignmentOrigin.y * size.y,
              position.z - alignmentOrigin.z * size.z
            )
          }

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
          const transform = getMutableComponent(entity, TransformComponent)
          transform.position.value.copy(finalPosition)
          transform.rotation.value.copy(finalRotation)
          transform.scale.value.copy(Vector3_One)
          transform.matrix.value.copy(matrix)

          // Apply content-fit to contentEntity
          if (layout.contentEntity.value !== UndefinedEntity) {
            const contentTransform = getMutableComponent(layout.contentEntity.value, TransformComponent)
            if (contentTransform) {
              const contentBounds = getComponent(layout.contentEntity.value, BoundingBoxComponent)

              if (contentBounds) {
                // Apply rotation to the content bounds
                const rotatedBox = contentBounds.objectSpaceBox.clone()
                rotatedBox.applyQuaternion(rotation)
                const contentSize = rotatedBox.getSize(new Vector3())
                const containerAspectRatio = size.x / size.y
                const contentAspectRatio = contentSize.x / contentSize.y

                let baseScaleX = 1
                let baseScaleY = 1

                switch (contentFit) {
                  case ContentFit.contain:
                    if (containerAspectRatio > contentAspectRatio) {
                      baseScaleX = baseScaleY = size.y / contentSize.y
                    } else {
                      baseScaleX = baseScaleY = size.x / contentSize.x
                    }
                    break
                  case ContentFit.cover:
                    if (containerAspectRatio > contentAspectRatio) {
                      baseScaleX = baseScaleY = size.x / contentSize.x
                    } else {
                      baseScaleX = baseScaleY = size.y / contentSize.y
                    }
                    break
                  case ContentFit.fill:
                    baseScaleX = size.x / contentSize.x
                    baseScaleY = size.y / contentSize.y
                    break
                  case ContentFit.none:
                    // No scaling
                    break
                  case ContentFit.scaleDown:
                    baseScaleX = baseScaleY = Math.min(1, size.x / contentSize.x, size.y / contentSize.y)
                    break
                }

                // Apply the contentFitScale
                contentTransform.scale.value.set(
                  baseScaleX * contentFitScale.x,
                  baseScaleY * contentFitScale.y,
                  contentFitScale.z
                )
              }
            }
          }

          return false
        }
      })
    }, [containerEntity])

    return null
  }
})

const _box = new Box3()

function useOrientedContentBounds(entity: Entity): State<Vector3> {
  const bounds = useHookstate(() => new Box3())
  const layout = LayoutComponent.useEffectiveState(entity)
  const rotation = layout.rotation.value
  const meshes = useChildrenWithComponents(entity, [MeshComponent, TransformComponent])

  useImmediateEffect(() => {
    const box = new Box3()
    meshes.forEach((entity) => {
      const mesh = getComponent(entity, MeshComponent)
      const transform = getComponent(entity, TransformComponent)
      if (!mesh.geometry) return
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
      const geometryBox = _box.copy(mesh.geometry.boundingBox)
      geometryBox.applyMatrix4(transform.matrix.value)
      geometryBox.applyMatrix4(new Matrix4().makeRotationFromQuaternion(rotation))
      box.union(geometryBox)
    })
    bounds.set(box)
    return null
  }, meshes)

  return bounds
}

/**
 * Return the matrix that converts a point from the content space to the container space.
 * @param entity
 */
function useContentToContainerMatrix(entity: Entity) {}

/**
 * @param contentEntity
 * @returns oriented content size from the bounding box component
 */
function useContentSize(entity: Entity): State<Vector3> {
  const size = useHookstate(() => new Vector3())
  const layout = LayoutComponent.useEffectiveState(entity)
  const rotation = layout.rotation.value
  const boundingBox = useOptionalComponent(entity, BoundingBoxComponent)
  boundingBox?.objectSpaceBox.value
    .clone()
    .applyMatrix4(new Matrix4().makeRotationFromQuaternion(rotation))
    .getSize(size)
  return size
}

function useEffectiveLayout(entity: Entity) {
  const layout = useComponent(entity, LayoutComponent)
  const position = useUnit3Normalized(layout.position.ornull ?? layout.defaults.position)
  const origin = useUnit3Normalized(layout.origin.ornull ?? layout.defaults.origin)
  const rotation = layout.rotation.ornull ?? layout.defaults.rotation
  const rotationOrigin = useUnit3Normalized(layout.rotationOrigin.ornull ?? layout.defaults.rotationOrigin)
  const size = useUnit3Normalized(layout.size.ornull ?? layout.defaults.size)
  const contentFit = useHookstate(() => new Vector3(1, 1, 1))
  return {
    ...layout,
    position,
    origin,
    rotation,
    rotationOrigin,
    size,
    contentFit
  }
}

function useUnitNormalized(
  state: State<Static<typeof UnitSchema>>,
  normalizedState: State<Static<typeof UnitNormalizedSchema>>
): State<Static<typeof UnitNormalizedSchema>> {
  if (typeof state.value === 'string') {
    const match = state.value.match(/([0-9.]+)([a-z]+)/)
    if (match) {
      const value = parseFloat(match[1])
      const unit = match[2]
      switch (unit) {
        case 'mm':
          normalizedState.millimeters.set(value)
          break
        case 'px':
          normalizedState.pixels.set(value)
          break
        case '%':
          normalizedState.percent.set(value)
          break
      }
    }
  } else if (typeof state.value === 'number') {
    normalizedState.millimeters.set(typeof state.value === 'number' ? state.value : 0)
    normalizedState.pixels.set(0)
    normalizedState.percent.set(0)
  }
  return normalizedState
}

function useUnit3Normalized(state: State<Static<ReturnType<typeof defineUnit3>>>) {
  const normalizedState = useHookstate(() => CreateSchemaValue(Unit3NormalizedSchema))
  useUnitNormalized(state.x, normalizedState.x)
  useUnitNormalized(state.y, normalizedState.y)
  useUnitNormalized(state.z, normalizedState.z)
  return normalizedState
}
