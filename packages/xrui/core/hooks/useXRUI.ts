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

import { createEntity, setComponent, useComponent } from '@ir-engine/ecs'
import { useMutableState } from '@ir-engine/hyperflux'
import React from 'react'
import { HTMLSnapshotData, XRUIState } from '../XRUIState'
import { Bounds } from '../classes/Bounds'
import { Edges } from '../classes/Edges'
import { HTMLComponent } from '../components/HTMLComponent'
import { bufferToHex } from '../hex-utils'

export function useXRUILayer() {
  const entity = React.useMemo(() => {
    const entity = createEntity()
    setComponent(entity, HTMLComponent)
    return entity
  }, [])

  const layer = useComponent(entity, HTMLComponent)

  const layerState = useMutableState(XRUIState)

  React.useEffect(() => {
    return () => {
      layer.__internal.snapshotHash.set('')
      // XRUILayerComponent will destroy the entity when exit transition completes
    }
  }, [])

  // generate snapshot for serialization and rasterization
  React.useLayoutEffect(() => {
    const el = layer.element.value as HTMLElement

    // generate a snapshot that includes the element and its children, excluding descendent elements with the xr-layer attribute
    const snapshot = createLayerSnapshot(el) as HTMLSnapshotData
    snapshot.metrics = extractLayerMetrics(el)

    // generate a hash of the unprocessed snapshot for caching purposes
    let abort = false
    let cleanup = () => {}
    const serializer = new XMLSerializer()
    const textEncoder = new TextEncoder()
    const unprocessedSerializedDOM = serializer.serializeToString(snapshot.clonedElement as HTMLElement)
    crypto.subtle
      .digest('SHA-1', textEncoder.encode(unprocessedSerializedDOM))
      .then((hash) => {
        snapshot.hash =
          bufferToHex(hash) +
          '?w=' +
          snapshot.metrics.fullWidth +
          ';h=' +
          snapshot.metrics.fullHeight +
          ';tw=' +
          snapshot.metrics.textureWidth +
          ';th=' +
          snapshot.metrics.textureHeight
      })
      .then(() => {
        // if the snapshot is still valid, set it
        if (!abort) {
          layer.__internal.snapshotHash.set(snapshot.hash)
          const snapshotState = layerState.snapshots[snapshot.hash]
          if (!snapshotState.value) snapshotState.set(snapshot)
          snapshotState.referenceCount.set(snapshotState.referenceCount.value + 1)
          cleanup = () => {
            snapshotState.referenceCount.set(snapshotState.referenceCount.value - 1)
          }
        }
      })

    return () => {
      abort = true
      cleanup()
    }
  })

  return {
    ref: (v: HTMLElement | null) => {
      v?.setAttribute('xrui-layer', 'true')
      layer.element.set(v)
    },
    entity,
    state: layer
  }
}

function createLayerSnapshot(node: Node): Pick<HTMLSnapshotData, 'clonedElement' | 'fontFamilies'> {
  // If the node is an element and has the xr-layer attribute
  const fonts = new Set<string>()
  let clone: Node

  if (node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute('xrui-layer')) {
    // Create an invisible placeholder that retains layout
    const placeholder = document.createElement('div')
    const placeholderStyle = placeholder.attributeStyleMap
    const computedStyle = (node as Element).computedStyleMap()

    // Copy over essential styles to maintain layout integrity
    placeholderStyle.set('display', computedStyle.getAll('display'))
    placeholderStyle.set('position', computedStyle.getAll('position'))
    placeholderStyle.set('margin', computedStyle.getAll('margin'))
    placeholderStyle.set('padding', computedStyle.getAll('padding'))
    placeholderStyle.set('border', computedStyle.getAll('border'))
    placeholderStyle.set('width', computedStyle.getAll('width'))
    placeholderStyle.set('height', computedStyle.getAll('height'))
    placeholderStyle.set('flex', computedStyle.getAll('flex'))
    placeholderStyle.set('grid-area', computedStyle.getAll('grid-area'))
    placeholderStyle.set('box-sizing', computedStyle.getAll('box-sizing'))
    placeholderStyle.set('visibility', ['hidden']) // Invisible but takes up space

    // Special handling for Flexbox and Grid layouts
    const displayStyle = computedStyle.get('display')?.toString() ?? ''
    if (displayStyle.includes('flex') || displayStyle.includes('grid')) {
      // Copy flex/grid specific properties
      placeholderStyle.set('flex-grow', computedStyle.getAll('flex-grow'))
      placeholderStyle.set('flex-shrink', computedStyle.getAll('flex-shrink'))
      placeholderStyle.set('flex-basis', computedStyle.getAll('flex-basis'))
      placeholderStyle.set('grid-column', computedStyle.getAll('grid-column'))
      placeholderStyle.set('grid-row', computedStyle.getAll('grid-row'))
      // Copy min/max dimensions
      placeholderStyle.set('min-width', computedStyle.getAll('min-width'))
      placeholderStyle.set('min-height', computedStyle.getAll('min-height'))
      placeholderStyle.set('max-width', computedStyle.getAll('max-width'))
      placeholderStyle.set('max-height', computedStyle.getAll('max-height'))
      // Copy alignment properties
      placeholderStyle.set('align-self', computedStyle.getAll('align-self'))
      placeholderStyle.set('justify-self', computedStyle.getAll('justify-self'))
    }

    clone = placeholder
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    // Otherwise, clone the node and recursively clone its children
    const computedStyle = el.computedStyleMap()
    const fontFamilyValues = computedStyle.getAll('font-family')
    const fontFamily = fontFamilyValues.flatMap((value) =>
      value
        .toString()
        .split(',')
        .map((f) => f.trim())
    )
    for (const font of fontFamily) fonts.add(font)
    clone = node.cloneNode(false) // Shallow clone
    // remove xrui-attributes
    for (const attr of el.attributes) {
      if (attr.name.startsWith('xrui-')) {
        ;(clone as Element).removeAttribute(attr.name)
      }
    }
    for (const child of node.childNodes) {
      const snapshot = createLayerSnapshot(child)
      clone.appendChild(snapshot.clonedElement)
      snapshot.fontFamilies.forEach(fonts.add, fonts)
    }
  } else {
    // Otherwise, simply clone it
    clone = node.cloneNode(true)
  }

  return {
    clonedElement: clone as HTMLElement,
    fontFamilies: Array.from(fonts)
  }
}

function extractLayerMetrics(element: HTMLElement): HTMLSnapshotData['metrics'] {
  const computedStyle = getComputedStyle(element)

  const metrics = {
    bounds: new Bounds().copy(element.getBoundingClientRect()),
    margin: new Edges().copy({
      top: Number.parseFloat(computedStyle.marginTop),
      right: Number.parseFloat(computedStyle.marginRight),
      bottom: Number.parseFloat(computedStyle.marginBottom),
      left: Number.parseFloat(computedStyle.marginLeft)
    }),
    padding: new Edges().copy({
      top: Number.parseFloat(computedStyle.paddingTop),
      right: Number.parseFloat(computedStyle.paddingRight),
      bottom: Number.parseFloat(computedStyle.paddingBottom),
      left: Number.parseFloat(computedStyle.paddingLeft)
    }),
    border: new Edges().copy({
      top: Number.parseFloat(computedStyle.borderTopWidth),
      right: Number.parseFloat(computedStyle.borderRightWidth),
      bottom: Number.parseFloat(computedStyle.borderBottomWidth),
      left: Number.parseFloat(computedStyle.borderLeftWidth)
    })
  } as HTMLSnapshotData['metrics']

  metrics.fullWidth =
    metrics.bounds.width + metrics.margin.left + metrics.margin.right + metrics.border.left + metrics.border.right
  metrics.fullHeight =
    metrics.bounds.height + metrics.margin.top + metrics.margin.bottom + metrics.border.top + metrics.border.bottom
  metrics.textureWidth = Math.max(nextPowerOf2(metrics.fullWidth), 32)
  metrics.textureHeight = Math.max(nextPowerOf2(metrics.fullHeight), 32)

  return metrics
}

function nearestPowerOf2(n: number) {
  return 1 << (31 - Math.clz32(n))
}

function nextPowerOf2(n: number) {
  return nearestPowerOf2((n - 1) * 2)
}
