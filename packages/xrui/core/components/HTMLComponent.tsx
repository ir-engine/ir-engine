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
  ComponentType,
  PresentationSystemGroup,
  S,
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { State, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import {
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Shape,
  ShapeGeometry,
  Texture,
  Vector3
} from 'three'
import { XRUIState } from '../XRUIState'
import { Bounds } from '../classes/Bounds'
import { TimestampedValue, Transition } from '../classes/Transition'
import { getViewportBounds } from '../dom-utils'
import { LayoutComponent } from './LayoutComponent'

export interface BorderRadius {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}

export const PIXELS_TO_METERS = 0.001

export const HTMLComponent = defineComponent({
  name: 'HTMLComponent',

  schema: S.Object({
    element: S.Optional(S.Type<HTMLElement>()),

    stackGroup: S.Class(() => new Group()),
    backgroundMesh: S.Type<Mesh>(),

    opacity: S.Number(1),
    opacityTransition: Transition.defineScalarTransition(),

    texture: S.Optional(S.Type<Texture>()),
    textureTransition: Transition.defineScalarTransition(),

    borderRadius: S.Object({
      topLeft: S.Number(0),
      topRight: S.Number(0),
      bottomLeft: S.Number(0),
      bottomRight: S.Number(0)
    }),

    borderRadiusTransition: Transition.defineBorderRadiusTransition(),

    backgroundColor: S.Color(0xffffff),
    backgroundColorTransition: Transition.defineScalarTransition(),

    backgroundTranslucency: S.Number(0),
    backgroundTranslucencyTransition: Transition.defineScalarTransition(),

    ready: S.Bool(false),

    domRect: S.Class(() => new Bounds()),

    __internal: S.Object({
      snapshotHash: S.String(''),
      layerBuffer: S.Array(S.Type<TimestampedValue<Mesh>>()),
      currentBorderRadius: S.Object({
        topLeft: S.Number(0),
        topRight: S.Number(0),
        bottomLeft: S.Number(0),
        bottomRight: S.Number(0)
      })
    })
  }),

  reactor: () => {
    const entity = useEntityContext()
    const layer = useComponent(entity, HTMLComponent)
    const layout = useOptionalComponent(entity, LayoutComponent)
    const parentLayerEntity = useAncestorWithComponents(entity, [HTMLComponent])
    const parentLayoutEntity = useAncestorWithComponents(entity, [LayoutComponent])
    const parentLayer = useOptionalComponent(parentLayerEntity, HTMLComponent)
    const parentLayout = useOptionalComponent(parentLayerEntity ?? parentLayoutEntity, LayoutComponent)
    const layerState = useMutableState(XRUIState)

    const snapshotData = layerState.snapshots[layer.__internal.snapshotHash.value]
    const textureData = layerState.textures[snapshotData.textureHash.ornull?.value ?? '']

    // setup on mount
    useImmediateEffect(() => {
      if (!hasComponent(entity, VisibleComponent)) setComponent(entity, VisibleComponent)
      if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)
      if (!hasComponent(entity, LayoutComponent)) setComponent(entity, LayoutComponent)
      addObjectToGroup(entity, layer.stackGroup.value as Group)
      const mesh = new Mesh(
        undefined,
        new MeshBasicMaterial({
          opacity: 0,
          color: 0xffffff,
          transparent: true
        })
      )
      mesh.renderOrder = -1
      layer.stackGroup.value.add(mesh)
      layer.backgroundMesh.set(mesh)
    }, [])

    // setup background layer
    useImmediateEffect(() => {
      const opacity = (layer.backgroundMesh.value?.material as MeshBasicMaterial).opacity ?? 0
      const material =
        layer.backgroundTranslucency.value > 0
          ? new MeshPhysicalMaterial({
              color: new Color('#B9B9B9'),
              transmission: 0,
              roughness: 0.5,
              opacity,
              transparent: true,
              side: DoubleSide
            })
          : new MeshBasicMaterial({ color: 0xffffff, opacity, transparent: true })
      layer.backgroundMesh.material.set(material)
    }, [layer.backgroundTranslucency])

    // setup foreground layers
    // useImmediateEffect(() => {
    //   const now = getState(ECSState).frameTime
    //   const material = new MeshBasicMaterial({ map: layer.texture.value as Texture, transparent: true, opacity: 0 })
    //   const mesh = new Mesh(geometry, material)
    //   layer.__internal.layerBuffer.merge([
    //     {
    //       timestamp: now,
    //       value: mesh
    //     }
    //   ])
    //   addObjectToGroup(entity, mesh)
    //   mesh.renderOrder = layer.__internal.layerBuffer.length - 1
    // }, [layer.texture, geometry])

    // process changes to snapshot texture data
    // React.useEffect(() => {
    //   if (!layer.__internal.snapshot.value) return
    //   if (!layout) return

    //   layer.ready.set(false)

    //   const snapshot = layer.__internal.snapshot.value

    //   const layerState.states[snapshot.hash]

    //   return () => {
    //     abort = true
    //     // cancel unfinished update
    //   }
    // }, [layer.element, !!layout, parentLayer?.domRect, layer.autoUpdateLayout])

    // update layout

    let geometry: ShapeGeometry | null = null
    let lastGeometryHash: string = ''
    const layoutSize = new Vector3()
    let lastTranslucency = useExecute(
      () => {
        const layout = getComponent(entity, LayoutComponent)
        const html = getComponent(entity, HTMLComponent)

        if (layout.computedLayout) layout.computedLayout.box.getSize(layoutSize)
        else layoutSize.copy(Vector3_Zero)
        const geometryHash = createRoundedRectangleGeometryHash(layoutSize, layer.borderRadius.value)

        if (!geometry || geometryHash !== lastGeometryHash) {
          // update geometry
          geometry = createRoundedRectangleGeometry(layoutSize, layer.borderRadius.value)
          lastGeometryHash = geometryHash
        }

        const backgroundColor = html.backgroundColorTransition.current
        const backgroundOpacity = html.opacityTransition.current
        const backgroundTranslucency = html.backgroundTranslucencyTransition.current
        const backgroundMesh = html.backgroundMesh
        if (backgroundTranslucency > 0) {
          let mat = backgroundMesh.material as MeshPhysicalMaterial
          if (mat.type !== 'MeshPhysicalMaterial') {
            mat = new MeshPhysicalMaterial({
              color: new Color('#B9B9B9'),
              transmission: 0,
              roughness: 0.5,
              // opacity,
              transparent: true,
              side: DoubleSide
            })
          }
          mat.opacity = backgroundOpacity
          mat.transmission = backgroundTranslucency
          // mat.color = backgroundColor
        }
      },
      { with: PresentationSystemGroup }
    )
  }
})

function createRoundedRectangleGeometryHash(size: Vector3, borderRadius: BorderRadius): string {
  return `${size.x},${size.y},${borderRadius.topLeft},${borderRadius.topRight},${borderRadius.bottomRight},${borderRadius.bottomLeft}`
}

function createRoundedRectangleGeometry(size: Vector3, borderRadius: BorderRadius): THREE.ShapeGeometry {
  const shape = new Shape()
  const { topLeft, topRight, bottomRight, bottomLeft } = borderRadius
  const width = size.x
  const height = size.y

  // Helper function to create a corner arc
  const createCornerArc = (centerX: number, centerY: number, startAngle: number, endAngle: number, radius: number) => {
    const x = centerX + Math.cos(endAngle) * radius
    const y = centerY + Math.sin(endAngle) * radius
    shape.absarc(centerX, centerY, radius, startAngle, endAngle, false)
    return { x, y }
  }

  // Top-left corner
  shape.moveTo(topLeft, 0)
  createCornerArc(topLeft, topLeft, Math.PI, Math.PI * 1.5, topLeft)

  // Top-right corner
  shape.lineTo(width - topRight, 0)
  createCornerArc(width - topRight, topRight, Math.PI * 1.5, 0, topRight)

  // Bottom-right corner
  shape.lineTo(width, height - bottomRight)
  createCornerArc(width - bottomRight, height - bottomRight, 0, Math.PI * 0.5, bottomRight)

  // Bottom-left corner
  shape.lineTo(bottomLeft, height)
  createCornerArc(bottomLeft, height - bottomLeft, Math.PI * 0.5, Math.PI, bottomLeft)

  // Close the shape
  shape.lineTo(0, topLeft)

  return new ShapeGeometry(shape)
}

export function updateDefaultLayoutFromDOM(
  layout: State<ComponentType<typeof LayoutComponent>>,
  rect: Bounds,
  parentRect: Bounds
) {
  const widthRatio = rect.width / parentRect.width
  const heightRatio = rect.height / parentRect.height

  // layout.defaults.positionOrigin.value.setScalar(0)
  // layout.defaults.alignmentOrigin.value.setScalar(0)

  // if (widthRatio === 1) {
  //   layout.defaults.sizeMode.x.set('proportional')
  //   layout.defaults.size.x.set(1)
  // } else {
  //   layout.defaults.sizeMode.x.set('literal')
  //   layout.defaults.size.x.set(rect.width)
  // }

  // if (heightRatio === 1) {
  //   layout.defaults.sizeMode.y.set('proportional')
  //   layout.defaults.size.y.set(1)
  // } else {
  //   layout.defaults.sizeMode.y.set('literal')
  //   layout.defaults.size.y.set(rect.height)
  // }

  layout.defaults.size.z.set(0)

  // layout.defaults.position.value
  //   .set(rect.left - (parentRect?.left ?? 0), rect.top - (parentRect?.top ?? 0), 0)
  //   .multiplyScalar(PIXELS_TO_METERS)
  // layout.defaults.rotation.value.set(0, 0, 0, 1)
  // layout.defaults.rotationOrigin.value.set(0.5, 0.5, 0)
}

const viewportBounds = new Bounds()

/*
 * On some mobile browsers, the value reported by window.innerHeight
 * is not the true viewport height. This method returns
 * the actual viewport.
 */
export function _getViewportBounds() {
  return getViewportBounds(viewportBounds)
}

const renderedFontCache = new Map()

function getRenderedFont(element) {
  const computedStyle = getComputedStyle(element)
  const fontFamily = computedStyle.fontFamily // e.g. "Arial, sans-serif"

  if (renderedFontCache.has(fontFamily)) {
    return renderedFontCache.get(fontFamily)
  }

  const fonts = fontFamily.split(',').map((f) => f.trim())
  const testString = 'ABCDWxyz0123'

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!

  const baselineFont = 'monospace'
  context.font = `100px ${baselineFont}`
  const baselineWidth = context.measureText(testString).width

  let selectedFont = fonts[0]

  for (let font of fonts) {
    context.font = `100px ${font}, ${baselineFont}`
    const width = context.measureText(testString).width

    if (width !== baselineWidth) {
      selectedFont = font
      break
    }
  }

  renderedFontCache.set(fontFamily, selectedFont)
  return selectedFont
}
