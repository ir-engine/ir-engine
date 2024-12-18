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
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { CreateSchemaValue } from '@ir-engine/ecs/src/schemas/JSONSchemaUtils'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { State, getState, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { Vector3_One, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { Box3, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
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

export const LayoutSpace = {
  World: 'World' as const,
  ViewingFrustum: 'ViewingFrustum' as const
}

export const UnitSchema = S.Union([UnitNormalizedSchema, S.String(), S.Number()], 0)

export const Unit3NormalizedSchema = S.Object({
  x: UnitNormalizedSchema,
  y: UnitNormalizedSchema,
  z: UnitNormalizedSchema
})

const PIXELS_PER_MM = 1000

function unitsToViewingFrustumSpace(
  units: Static<typeof UnitNormalizedSchema>,
  containerUnitSize: number,
  pixelsPerUnit: number
) {
  return (units.pixels + units.millimeters * PIXELS_PER_MM) * pixelsPerUnit + units.percent * containerUnitSize
}

function unitsToWorldSpace(units: Static<typeof UnitNormalizedSchema>, containerMMSize: number) {
  return units.pixels / PIXELS_PER_MM + units.millimeters + units.percent * containerMMSize
}

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

    containerEntity: S.Entity(),

    computedLayout: S.NonSerialized(
      S.Optional(
        S.Object({
          box: S.Class(() => new Box3()),
          rotation: S.Quaternion(),
          space: S.Enum(LayoutSpace)
        })
      )
    )
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

    const frameTime = getState(ECSState).frameTime
    Transition.useTransitionTarget(layout.positionTransition, layout.position, frameTime)
    Transition.useTransitionTarget(layout.originTransition, layout.origin, frameTime)
    Transition.useTransitionTarget(layout.rotationTransition, layout.rotation, frameTime)
    Transition.useTransitionTarget(layout.rotationOriginTransition, layout.rotationOrigin, frameTime)
    Transition.useTransitionTarget(layout.sizeTransition, layout.size, frameTime)
    Transition.useTransitionTarget(layout.contentFitTransition, layout.contentFit, frameTime)

    // Reusable objects for calculations
    const finalPosition = new Vector3()
    const finalRotationOriginOffset = new Vector3()
    const finalRotation = new Quaternion()
    const finalScale = new Vector3()
    const finalSize = new Vector3()

    const matrix = new Matrix4()
    const tempMatrix = new Matrix4()
    const containerWorldRotation = new Matrix4()
    const containerWorldQuaternion = new Quaternion()

    useImmediateEffect(() => {
      setComponent(entity, ComputedTransformComponent, {
        referenceEntities: [containerEntity],

        computeFunction: () => {
          const frameTime = getState(ECSState).frameTime

          // Update transitions
          const l = getComponent(entity, LayoutComponent)
          Transition.computeCurrentValue(l.positionTransition, frameTime)
          Transition.computeCurrentValue(l.originTransition, frameTime)
          Transition.computeCurrentValue(l.rotationTransition, frameTime)
          Transition.computeCurrentValue(l.rotationOriginTransition, frameTime)
          Transition.computeCurrentValue(l.sizeTransition, frameTime)
          Transition.computeCurrentValue(l.contentFitTransition, frameTime)

          // Get current values
          const position = l.positionTransition.current
          const origin = l.originTransition.current
          const rotation = l.rotationTransition.current
          const rotationOrigin = l.rotationOriginTransition.current
          const size = l.sizeTransition.current
          const contentFitScale = l.contentFitTransition.current

          // Get the container details
          const containerEntity = l.containerEntity
          const rootContainerEntity = LayoutComponent.getRootContainerEntity(entity)
          const camera = getOptionalComponent(rootContainerEntity, CameraComponent)
          const renderer = getOptionalComponent(rootContainerEntity, RendererComponent)
          const containerLayout = getOptionalComponent(containerEntity, LayoutComponent)
          const containerTransform = getComponent(containerEntity, TransformComponent)
          let containerComputedLayoutBounds = containerLayout?.computedLayout

          containerWorldQuaternion.setFromRotationMatrix(
            containerTransform.matrixWorld.extractRotation(containerWorldRotation)
          )

          // if container doesn't have already have computed layout bounds, compute them
          if (!containerComputedLayoutBounds && camera && renderer) {
            // NDC bounds
            containerComputedLayoutBounds = {
              box: new Box3(),
              rotation: containerWorldQuaternion,
              space: LayoutSpace.ViewingFrustum
            }
          } else if (!containerComputedLayoutBounds) {
            // layout bounds
            containerComputedLayoutBounds = {
              box: new Box3(Vector3_Zero.clone(), Vector3_Zero.clone()),
              rotation: containerWorldQuaternion,
              space: LayoutSpace.ViewingFrustum
            }
            // containerComputedLayoutBounds = computeLayoutBounds(containerEntity)
          }

          const containerSizeX = Math.abs(
            containerComputedLayoutBounds.box.max.x - containerComputedLayoutBounds.box.min.x
          )
          const containerSizeY = Math.abs(
            containerComputedLayoutBounds.box.max.y - containerComputedLayoutBounds.box.min.y
          )
          const containerSizeZ = Math.abs(
            containerComputedLayoutBounds.box.max.z - containerComputedLayoutBounds.box.min.z
          )

          if (
            containerComputedLayoutBounds.space === LayoutSpace.ViewingFrustum &&
            camera &&
            renderer?.renderer &&
            renderer.canvas
          ) {
            const viewportPixelHeight = renderer.canvas.clientHeight
            const viewportPixelWidth = renderer.canvas.clientWidth
            const viewportPixelDepth = computeViewportPixelDepth(
              containerComputedLayoutBounds.box.min.z,
              camera,
              renderer.renderer!
            )
            // ViewportFrustum space is from top-left-back (0,0,0) corner to front-right-bottom corner of frustum (1,1,1)
            const sizeX = unitsToViewingFrustumSpace(size.x, containerSizeX, viewportPixelWidth)
            const sizeY = unitsToViewingFrustumSpace(size.y, containerSizeY, viewportPixelHeight)
            const sizeZ = unitsToViewingFrustumSpace(size.z, containerSizeZ, viewportPixelDepth)
            const positionX = unitsToViewingFrustumSpace(position.x, containerSizeX, viewportPixelWidth)
            const positionY = unitsToViewingFrustumSpace(position.y, containerSizeY, viewportPixelHeight)
            const positionZ = unitsToViewingFrustumSpace(position.z, containerSizeZ, viewportPixelDepth)
            const originX = unitsToViewingFrustumSpace(origin.x, sizeX, viewportPixelWidth)
            const originY = unitsToViewingFrustumSpace(origin.y, sizeY, viewportPixelHeight)
            const originZ = unitsToViewingFrustumSpace(origin.z, sizeZ, viewportPixelDepth)
            const rotationOriginX = unitsToViewingFrustumSpace(rotationOrigin.x, sizeX, viewportPixelWidth)
            const rotationOriginY = unitsToViewingFrustumSpace(rotationOrigin.y, sizeY, viewportPixelHeight)
            const rotationOriginZ = unitsToViewingFrustumSpace(rotationOrigin.z, sizeZ, viewportPixelDepth)
            finalPosition.set(positionX - originX, positionY - originY, positionZ - originZ)
            finalRotationOriginOffset.set(rotationOriginX, rotationOriginY, rotationOriginZ)
            finalSize.set(sizeX, sizeY, sizeZ)
          } else if (containerComputedLayoutBounds.space === LayoutSpace.World) {
            // World space is from the container's top-left-back to the front-right-bottom corner of the container
            const sizeX = unitsToWorldSpace(size.x, containerSizeX)
            const sizeY = unitsToWorldSpace(size.y, containerSizeY)
            const sizeZ = unitsToWorldSpace(size.z, containerSizeZ)
            const positionX = unitsToWorldSpace(position.x, containerSizeX)
            const positionY = unitsToWorldSpace(position.y, containerSizeY)
            const positionZ = unitsToWorldSpace(position.z, containerSizeZ)
            const originX = unitsToWorldSpace(origin.x, sizeX)
            const originY = unitsToWorldSpace(origin.y, sizeY)
            const originZ = unitsToWorldSpace(origin.z, sizeZ)
            const rotationOriginX = unitsToWorldSpace(rotationOrigin.x, containerSizeX)
            const rotationOriginY = unitsToWorldSpace(rotationOrigin.y, containerSizeY)
            const rotationOriginZ = unitsToWorldSpace(rotationOrigin.z, containerSizeZ)
            finalPosition.set(positionX - originX, positionY - originY, positionZ - originZ)
            finalRotationOriginOffset.set(rotationOriginX, rotationOriginY, rotationOriginZ)
            finalSize.set(sizeX, sizeY, sizeZ)
          }

          // Create a matrix to combine rotation and position
          matrix.compose(finalPosition, rotation, Vector3_One)

          // Apply rotation origin offset
          tempMatrix.makeTranslation(
            finalRotationOriginOffset.x,
            finalRotationOriginOffset.y,
            finalRotationOriginOffset.z
          )
          matrix.multiply(tempMatrix)
          tempMatrix.makeRotationFromQuaternion(rotation)
          matrix.multiply(tempMatrix)
          tempMatrix.makeTranslation(
            -finalRotationOriginOffset.x,
            -finalRotationOriginOffset.y,
            -finalRotationOriginOffset.z
          )
          matrix.multiply(tempMatrix)

          // Extract final position and rotation from the matrix
          matrix.decompose(finalPosition, finalRotation, finalScale)

          // Update the transform component
          const transform = getMutableComponent(entity, TransformComponent)
          transform.position.value.copy(finalPosition)
          transform.rotation.value.copy(finalRotation)
          transform.scale.value.copy(Vector3_One)
          transform.matrix.value.copy(matrix)

          // Apply content-fit to content
          // const contentBounds = getComponent(layout.contentEntity.value, BoundingBoxComponent)

          // if (contentBounds) {
          //   // Apply rotation to the content bounds
          //   const rotatedBox = contentBounds.objectSpaceBox.clone()
          //   rotatedBox.applyQuaternion(rotation)
          //   const contentSize = rotatedBox.getSize(new Vector3())
          //   const containerAspectRatio = size.x / size.y
          //   const contentAspectRatio = contentSize.x / contentSize.y

          //   let baseScaleX = 1
          //   let baseScaleY = 1

          //   switch (contentFit) {
          //     case ContentFit.contain:
          //       if (containerAspectRatio > contentAspectRatio) {
          //         baseScaleX = baseScaleY = size.y / contentSize.y
          //       } else {
          //         baseScaleX = baseScaleY = size.x / contentSize.x
          //       }
          //       break
          //     case ContentFit.cover:
          //       if (containerAspectRatio > contentAspectRatio) {
          //         baseScaleX = baseScaleY = size.x / contentSize.x
          //       } else {
          //         baseScaleX = baseScaleY = size.y / contentSize.y
          //       }
          //       break
          //     case ContentFit.fill:
          //       baseScaleX = size.x / contentSize.x
          //       baseScaleY = size.y / contentSize.y
          //       break
          //     case ContentFit.none:
          //       // No scaling
          //       break
          //     case ContentFit.scaleDown:
          //       baseScaleX = baseScaleY = Math.min(1, size.x / contentSize.x, size.y / contentSize.y)
          //       break
          //   }

          //   // Apply the contentFitScale
          //   contentTransform.scale.value.set(
          //     baseScaleX * contentFitScale.x,
          //     baseScaleY * contentFitScale.y,
          //     contentFitScale.z
          //   )
          // }

          return false
        }
      })
    }, [containerEntity])

    return null
  }
})

// const _layoutBox = new Box3()
// const _layoutWorldRotation = new Quaternion()

// function computeLayoutBounds(entity: Entity): Static<typeof LayoutComponent.schema.properties.computedLayoutBounds> {
//   const transform = getComponent(entity, TransformComponent)
//   const layout = getOptionalComponent(entity, LayoutComponent)

//   const bounds = {
//     min: _layoutBox.min,
//     max: _layoutBox.max,
//     rotation: layout?.rotation || layout?.defaults.rotation || transform.rotation,
//     space: LayoutSpace.World
//   }

//   const boundsBox = new Box3()

//   // reset entity transforms to calculate object-space bounding boxes
//   transform.position.setScalar(0)
//   transform.rotation.identity()
//   transform.scale.setScalar(1)

//   iterateEntityNode(entity, (entity) => {
//     const mesh = getOptionalComponent(entity, MeshComponent)
//     const transform = getOptionalComponent(entity, TransformComponent)
//     if (!mesh?.geometry || !transform) return
//     if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
//     const geometryBox = _layoutBox.copy(mesh.geometry.boundingBox!)
//     geometryBox.applyMatrix4(transform.matrix)
//     geometryBox.applyMatrix4(new Matrix4().makeRotationFromQuaternion(rotation))
//     boundsBox.union(geometryBox)
//   })

//   return bounds
// }

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

function computeViewportPixelDepth(
  z_NDC: number,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): number {
  // Ensure that z_NDC is within the valid range
  if (z_NDC < -1 || z_NDC > 1) {
    throw new Error('z_NDC must be between -1 and 1.')
  }

  // Step 1: Compute A and B from the camera's near and far planes
  const near = camera.near
  const far = camera.far

  const A = -(far + near) / (far - near)
  const B = -(2 * far * near) / (far - near)

  // Step 2: Compute z_camera from z_NDC
  const denominator = z_NDC + A
  if (denominator === 0) {
    throw new Error('Denominator in z_camera computation is zero.')
  }

  const z_camera = -B / denominator

  // Step 3: Calculate pixels per unit at z_camera depth
  const fov = MathUtils.degToRad(camera.fov) // Vertical FOV in radians
  const viewportHeight = renderer.domElement.clientHeight

  const tanFovOver2 = Math.tan(fov / 2)
  if (tanFovOver2 === 0) {
    throw new Error('Invalid camera field of view.')
  }

  const scaleFactor = viewportHeight / 2 / tanFovOver2 // Pixels per unit at z = 1
  const pixelDepth = -z_camera / scaleFactor // Negative z_camera because it's negative in front of the camera

  return pixelDepth
}
