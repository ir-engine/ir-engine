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

import { Bounds, Edges, traverseChildElements } from './dom-utils'
import { WebLayerManagerBase } from './WebLayerManagerBase'
import { WebRenderer } from './WebRenderer'

export type EventCallback = (event: 'layerpainted' | 'layercreated' | 'layermoved', data: { target: Element }) => void
export class WebLayer {
  isMediaElement = false
  isVideoElement = false
  isCanvasElement = false

  constructor(
    public manager: WebLayerManagerBase,
    public element: Element,
    public eventCallback: EventCallback
  ) {
    if (!manager) throw new Error('WebLayerManager must be initialized')
    WebRenderer.layers.set(element, this)
    element.setAttribute(WebRenderer.LAYER_ATTRIBUTE, '')
    this.parentLayer = WebRenderer.getClosestLayer(this.element, false)
    this.isVideoElement = element.nodeName === 'VIDEO'
    this.isMediaElement = this.isVideoElement || element.nodeName === 'IMG' || element.nodeName === 'CANVAS'
    this.eventCallback('layercreated', { target: element })
    // const prerasterizedElement = element.getAttribute('xr-prerasterized')
    // if (prerasterizedElement) {
    //   const split = prerasterizedElement.split('-')
    //   this.prerasterizedRange = _.range(parseInt(split[0]), parseInt(split[1]) + 1)
    //   this.prerasterizeRange()
    // }
  }

  desiredPseudoState = {
    hover: false,
    active: false,
    focus: false,
    target: false
  }

  //Only supports digits right now
  //TO DO: Add alphabetical range support, specific characters
  // prerasterizedRange = [] as number[]
  // prerasterizedImages: Map<string, string> = new Map()

  // async prerasterizeRange() {
  //   this.manager.prerasterized = true

  //   const startTime = Date.now()

  //   for (let i = 0; i < this.prerasterizedRange.length; i++) {
  //     const e = this.element.cloneNode(true) as HTMLElement
  //     e.textContent = this.prerasterizedRange[i].toString()
  //     console.log(this.prerasterizedRange[i].toString())
  //     const result = await this.manager.addToSerializeQueue(this, e)
  //     if (typeof result.stateKey === 'string' && result.svgUrl) {
  //       this.manager.addToRasterizeQueue(result.stateKey, result.svgUrl, this, this.prerasterizedRange[i].toString())
  //       console.log(Date.now() - startTime)
  //       //serialize a new element with text value set to a value from the range
  //       //pass serialized in to rasterization queue
  //       //then await it to be rasterized
  //       //when it is finished add the url to the images map
  //     }
  //   }

  //   this.manager.prerasterized = false

  //   console.log('image pushed, time spent:', Date.now() - startTime)
  //   console.log(this.prerasterizedImages)
  // }

  needsRefresh = true

  setNeedsRefresh(recurse = false) {
    this.needsRefresh = true
    if (recurse) for (const c of this.childLayers) c.setNeedsRefresh(recurse)
  }

  needsRemoval = false

  parentLayer?: WebLayer
  childLayers = [] as WebLayer[]

  set pixelRatio(val: number | null) {
    const isNumber = typeof val === 'number'
    if (isNumber) {
      this.element.setAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE, val.toString())
    } else {
      this.element.removeAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)
    }
  }

  get pixelRatio() {
    const val = this.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)!
    return val ? parseFloat(val) : null
  }

  get computedPixelRatio(): number {
    return this.pixelRatio ?? this.parentLayer?.computedPixelRatio ?? 1.5
  }

  allStateHashes = new Set<string>()

  previousDOMStateKey?: string | HTMLMediaElement

  desiredDOMStateKey?: string | HTMLMediaElement
  currentDOMStateKey?: string | HTMLMediaElement

  lastSVGUrl?: string

  get previousDOMState() {
    return this.previousDOMStateKey ? this.manager.getLayerState(this.previousDOMStateKey) : undefined
  }

  get desiredDOMState() {
    return this.desiredDOMStateKey ? this.manager.getLayerState(this.desiredDOMStateKey) : undefined
  }

  get currentDOMState() {
    return this.currentDOMStateKey ? this.manager.getLayerState(this.currentDOMStateKey) : undefined
  }

  domMetrics = {
    bounds: new Bounds(),
    padding: new Edges(),
    margin: new Edges(),
    border: new Edges()
  }

  get depth() {
    let depth = 0
    let layer = this as WebLayer
    while (layer.parentLayer) {
      layer = layer.parentLayer
      depth++
    }
    return depth
  }

  get rootLayer() {
    let rootLayer = this as WebLayer
    while (rootLayer.parentLayer) rootLayer = rootLayer.parentLayer
    return rootLayer
  }

  traverseParentLayers(each: (layer: WebLayer) => void) {
    const parentLayer = this.parentLayer
    if (parentLayer) {
      parentLayer.traverseParentLayers(each)
      each(parentLayer)
    }
  }

  traverseLayers(each: (layer: WebLayer) => void) {
    each(this)
    this.traverseChildLayers(each)
  }

  traverseChildLayers(each: (layer: WebLayer) => void) {
    for (const child of this.childLayers) {
      child.traverseLayers(each)
    }
  }

  update() {
    if (this.desiredDOMStateKey !== this.currentDOMStateKey) {
      const desired = this.desiredDOMState

      if (
        desired &&
        (this.isMediaElement ||
          desired.texture?.ktx2Url ||
          desired.texture?.canvas ||
          desired.fullWidth * desired.fullHeight === 0)
      ) {
        this.currentDOMStateKey = this.desiredDOMStateKey
      }
    }
    const prev = this.previousDOMState?.texture?.ktx2Url ?? this.previousDOMState?.texture?.canvas
    const current = this.currentDOMState?.texture?.ktx2Url ?? this.previousDOMState?.texture?.canvas
    if (current && prev !== current) {
      this.eventCallback('layerpainted', { target: this.element })
    }
    this.previousDOMStateKey = this.currentDOMStateKey
  }

  async refresh() {
    this.needsRefresh = false
    this._updateParentAndChildLayers()
    // if (this.element.hasAttribute('xr-prerasterized')) return

    const result = await this.manager.addToSerializeQueue(this)

    if (result.needsRasterize && typeof result.stateKey === 'string' && result.svgUrl)
      await this.manager.addToRasterizeQueue(result.stateKey, result.svgUrl)
  }

  private _updateParentAndChildLayers() {
    const element = this.element
    const childLayers = this.childLayers
    const oldChildLayers = childLayers.slice()

    const previousParentLayer = this.parentLayer
    this.parentLayer = WebRenderer.getClosestLayer(this.element, false)
    if (previousParentLayer !== this.parentLayer) {
      this.parentLayer && this.parentLayer.childLayers.push(this)
      this.eventCallback('layermoved', { target: element })
    }

    childLayers.length = 0
    traverseChildElements(element, this._tryConvertElementToWebLayer, this)

    for (const child of oldChildLayers) {
      const parentLayer = WebRenderer.getClosestLayer(child.element, false)
      if (!parentLayer) {
        child.needsRemoval = true
        childLayers.push(child)
      }
    }
  }

  private _tryConvertElementToWebLayer(n: Node) {
    if (this.needsRemoval) return false
    const el = n as HTMLElement
    const styles = getComputedStyle(el)
    const isLayer = el.hasAttribute(WebRenderer.LAYER_ATTRIBUTE)
    if (isLayer || el.nodeName === 'VIDEO' || styles.transform !== 'none') {
      let child = WebRenderer.layers.get(el)
      if (!child) {
        child = new WebLayer(this.manager, el, this.eventCallback)
      }
      this.childLayers.push(child)
      return false // stop traversing this subtree
    }
    return true
  }
}
