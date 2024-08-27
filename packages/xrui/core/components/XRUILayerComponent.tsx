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
  ECSState,
  PresentationSystemGroup,
  defineComponent,
  hasComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { State, getState, useImmediateEffect } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useAncestorWithComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import React from 'react'
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
import { Bounds } from '../classes/Bounds'
import { TimestampedValue, Transition } from '../classes/Transition'
import { getViewportBounds } from '../dom-utils'
import { XRLayoutComponent } from './XRLayoutComponent'

export interface XRUIBorderRadius {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}

export const PIXELS_TO_METERS = 0.001

export const XRUILayerComponent = defineComponent({
  name: 'XRUILayerComponent',

  onInit: (entity) => {
    return {
      element: null as HTMLElement | null,
      clonedElement: null as HTMLElement | null,

      stackGroup: new Group(),
      backgroundMesh: null! as Mesh,

      opacity: 1,
      opacityTransition: Transition.defineScalarTransition(),

      texture: null as Texture | null,
      textureTransition: Transition.defineScalarTransition(),

      borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 } as XRUIBorderRadius,
      borderRadiusTransition: Transition.defineBorderRadiusTransition(),

      backgroundColor: new Color(0xffffff),
      backgroundColorTransition: Transition.defineScalarTransition(),

      backgroundTranslucency: 0,
      backgroundTranslucencyTransition: Transition.defineScalarTransition(),

      ready: false,

      domRect: new Bounds(),

      autoUpdateLayout: true,

      __internal: {
        layerBuffer: [] as TimestampedValue<Mesh>[],
        currentBorderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 } as XRUIBorderRadius
      }
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const layer = useComponent(entity, XRUILayerComponent)
    const layout = useOptionalComponent(entity, XRLayoutComponent)
    const parentLayerEntity = useAncestorWithComponent(entity, XRUILayerComponent)
    const parentLayoutEntity = useAncestorWithComponent(entity, XRLayoutComponent)
    const parentLayer = useOptionalComponent(parentLayerEntity, XRUILayerComponent)
    const parentLayout = useOptionalComponent(parentLayerEntity ?? parentLayoutEntity, XRLayoutComponent)

    const geometry = React.useMemo(() => {
      return createRoundedRectangleGeometry(layout?.size.value ?? new Vector3(), layer.borderRadius.value)
    }, [layout, layer.borderRadius])

    // setup on mount
    useImmediateEffect(() => {
      if (!hasComponent(entity, VisibleComponent)) setComponent(entity, VisibleComponent)
      if (!hasComponent(entity, TransformComponent)) setComponent(entity, TransformComponent)
      if (!hasComponent(entity, XRLayoutComponent)) setComponent(entity, XRLayoutComponent)
      addObjectToGroup(entity, layer.stackGroup.value as Group)
      const mesh = new Mesh(
        geometry,
        new MeshBasicMaterial({
          opacity: 0
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
    useImmediateEffect(() => {
      const now = getState(ECSState).frameTime
      const material = new MeshBasicMaterial({ map: layer.texture.value as Texture, transparent: true, opacity: 0 })
      const mesh = new Mesh(geometry, material)
      layer.__internal.layerBuffer.merge([
        {
          timestamp: now,
          value: mesh
        }
      ])
      addObjectToGroup(entity, mesh)
      mesh.renderOrder = layer.__internal.layerBuffer.length - 1
    }, [layer.texture, geometry])

    // process changes to DOM
    React.useLayoutEffect(() => {
      if (!layer.element.value) return
      if (!layout) return

      layer.ready.set(false)

      // retrieve layout
      const rect = layer.element.value.getBoundingClientRect() as any as Bounds
      layer.domRect.set(rect)
      const parentRect = parentLayer?.domRect.value

      // generate texture
      const clonedElement = cloneDomWithXrLayerReplacement(layer.element.value)

      // update layout
      if (layer.autoUpdateLayout.value) {
        updateLayoutFromDomRects(layout, rect, parentRect ?? _getViewportBounds())
      }

      // update layout & texture

      layer.ready.set(true)

      return () => {
        // cancel unfinished update
      }
    }, [layer.element, !!layout, parentLayer?.domRect, layer.autoUpdateLayout])

    useExecute(() => {}, { with: PresentationSystemGroup })
  }
})

function createRoundedRectangleGeometry(size: Vector3, borderRadius: XRUIBorderRadius): THREE.ShapeGeometry {
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

export function updateLayoutFromDomRects(
  layout: State<ComponentType<typeof XRLayoutComponent>>,
  rect: Bounds,
  parentRect: Bounds
) {
  const widthRatio = rect.width / parentRect.width
  const heightRatio = rect.height / parentRect.height

  layout.positionOrigin.value.setScalar(0)
  layout.alignmentOrigin.value.setScalar(0)

  if (widthRatio === 1) {
    layout.sizeMode.x.set('proportional')
    layout.size.x.set(1)
  } else {
    layout.sizeMode.x.set('literal')
    layout.size.x.set(rect.width)
  }

  if (heightRatio === 1) {
    layout.sizeMode.y.set('proportional')
    layout.size.y.set(1)
  } else {
    layout.sizeMode.y.set('literal')
    layout.size.y.set(rect.height)
  }

  layout.size.z.set(0)

  layout.position.value
    .set(rect.left - (parentRect?.left ?? 0), rect.top - (parentRect?.top ?? 0), 0)
    .multiplyScalar(PIXELS_TO_METERS)
  layout.rotation.value.set(0, 0, 0, 1)
  layout.rotationOrigin.value.set(0.5, 0.5, 0)
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
  const fontFamily = computedStyle.fontFamily

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

function cloneDomWithXrLayerReplacement(node) {
  // If the node is an element and has the xr-layer attribute
  if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('xr-layer')) {
    // Create an invisible placeholder that retains layout
    const placeholder = document.createElement('div')
    const computedStyle = getComputedStyle(node)

    // Copy over essential styles to maintain layout integrity
    placeholder.style.display = computedStyle.display
    placeholder.style.position = computedStyle.position
    placeholder.style.margin = computedStyle.margin
    placeholder.style.padding = computedStyle.padding
    placeholder.style.width = computedStyle.width
    placeholder.style.height = computedStyle.height
    placeholder.style.flex = computedStyle.flex
    placeholder.style.gridArea = computedStyle.gridArea
    placeholder.style.visibility = 'hidden' // Invisible but takes up space
    placeholder.style.boxSizing = computedStyle.boxSizing

    // Special handling for Flexbox and Grid layouts
    if (computedStyle.display.includes('flex') || computedStyle.display.includes('grid')) {
      placeholder.style.minWidth = computedStyle.minWidth
      placeholder.style.minHeight = computedStyle.minHeight
      placeholder.style.maxWidth = computedStyle.maxWidth
      placeholder.style.maxHeight = computedStyle.maxHeight
      placeholder.style.alignSelf = computedStyle.alignSelf
      placeholder.style.justifySelf = computedStyle.justifySelf
    }

    return placeholder
  }

  // If the node is a text node, simply clone it
  if (node.nodeType === Node.TEXT_NODE) {
    return node.cloneNode(true)
  }

  // Otherwise, clone the node and recursively clone its children
  const clone = node.cloneNode(false) // Shallow clone
  for (let child of node.childNodes) {
    clone.appendChild(cloneDomWithXrLayerReplacement(child))
  }
  return clone
}
