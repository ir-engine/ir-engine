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
import React from 'react'
import { Bounds } from '../classes/Bounds'
import { Edges } from '../classes/Edges'
import { NodeSnapshot, XRUILayerComponent } from '../components/XRUILayerComponent'
import { bufferToHex } from '../hex-utils'

export function useXRUILayer() {
  const entity = React.useMemo(() => {
    const entity = createEntity()
    setComponent(entity, XRUILayerComponent)
    return entity
  }, [])

  const state = useComponent(entity, XRUILayerComponent)

  // generate snapshot for serialization and rasterization
  React.useLayoutEffect(() => {
    const el = state.element.value as HTMLElement
    if (!el) {
      state.__internal.snapshot.set(null)
      return
    }

    // generate a snapshot that includes the element and its children, excluding descendent elements with the xr-layer attribute
    const snapshot = createNodeSnapshot(el) as NodeSnapshot
    snapshot.metrics = extractDOMMetrics(el)

    // generate a hash of the unprocessed snapshot for caching purposes
    let abort = false
    const serializer = new XMLSerializer()
    const textEncoder = new TextEncoder()
    const unprocessedSerializedDOM = serializer.serializeToString(snapshot.clonedElement as HTMLElement)
    crypto.subtle
      .digest('SHA-1', textEncoder.encode(unprocessedSerializedDOM))
      .then((hash) => {
        snapshot.hash = bufferToHex(hash)
      })
      .then(() => {
        // if the snapshot is still valid, set it
        if (!abort) state.__internal.snapshot.set(snapshot)
      })

    return () => {
      abort = true
    }
  })

  return {
    ref: (v: HTMLElement | null) => {
      v?.setAttribute('xr-layer', 'true')
      state.element.set(v)
    },
    entity,
    state
  }
}

function createNodeSnapshot(node: Node): Pick<NodeSnapshot, 'clonedElement' | 'fontFamilies'> {
  // If the node is an element and has the xr-layer attribute
  const fonts = new Set<string>()
  let clone: Node

  if (node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute('xr-layer')) {
    // Create an invisible placeholder that retains layout
    const placeholder = document.createElement('div')
    const computedStyle = getComputedStyle(node as Element)

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

    clone = placeholder
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Otherwise, clone the node and recursively clone its children
    const computedStyle = getComputedStyle(node as Element)
    const fontFamily = computedStyle.fontFamily.split(',').map((f) => f.trim())
    for (const font of fontFamily) fonts.add(font)
    clone = node.cloneNode(false) // Shallow clone
    for (const child of node.childNodes) {
      const snapshot = createNodeSnapshot(child)
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

function extractDOMMetrics(element: HTMLElement) {
  const computedStyle = getComputedStyle(element)
  return {
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
  }
}
