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

import { Object3D, Raycaster, Vector3 } from 'three'

import { Bounds, downloadBlob, getBounds, toDOM, traverseChildElements } from '../dom-utils'
import { WebLayerOptions, WebRenderer } from '../WebRenderer'
import { ON_BEFORE_UPDATE, WebLayer3D } from './WebLayer3D'
import { WebLayerManager } from './WebLayerManager'

type Intersection = THREE.Intersection & { groupOrder: number }

export type WebLayerHit = ReturnType<typeof WebContainer3D.prototype.hitTest> & {}

const scratchVector = new Vector3()
const scratchVector2 = new Vector3()
const scratchBounds2 = new Bounds()

export interface WebContainer3DOptions extends WebLayerOptions {
  manager: WebLayerManager
  pixelRatio?: number
  layerSeparation?: number
  autoRefresh?: boolean
  onLayerCreate?(layer: WebLayer3D): void
  onLayerPaint?(layer: WebLayer3D): void
  // onLayerDOMChange?(layer: WebLayer3D): void
  renderOrderOffset?: number
}

/**
 * Transform a DOM tree into 3D layers.
 *
 * When an instance is created, a `xr-layer` is set on the
 * the passed DOM element to match this instance's Object3D id.
 * If the passed DOM element has an `id` attribute, this instance's Object3D name
 * will be set to match the element id.
 *
 * Child WebLayer3D instances can be specified with an `xr-layer` attribute,
 * which will be set when the child WebLayer3D instance is created automatically.
 * The attribute can be specified added in HTML or dynamically:
 *  - `<div xr-layer></div>`
 *
 * Additionally, the pixel ratio can be adjusted on each layer, individually:
 *  - `<div xr-layer xr-pixel-ratio="0.5"></div>`
 *
 * Default dimensions: 1px = 0.001 world dimensions = 1mm (assuming meters)
 *     e.g., 500px width means 0.5meters
 */
export class WebContainer3D extends Object3D {
  // static computeNaturalDistance(
  //   projection: THREE.Matrix4 | THREE.Camera,
  //   renderer: THREE.WebGLRenderer
  // ) {
  //   let projectionMatrix = projection as  THREE.Matrix4
  //   if ((projection as THREE.Camera).isCamera) {
  //     projectionMatrix = (projection as THREE.Camera).projectionMatrix
  //   }
  //   const pixelRatio = renderer.getPixelRatio()
  //   const widthPixels = renderer.domElement.width / pixelRatio
  //   const width = WebLayer3D.DEFAULT_PIXELS_PER_UNIT * widthPixels
  //   const horizontalFOV = getFovs(projectionMatrix).horizontal
  //   const naturalDistance = width / 2 / Math.tan(horizontalFOV / 2)
  //   return naturalDistance
  // }

  public containerElement!: Element

  public options!: WebContainer3DOptions

  public rootLayer!: WebLayer3D

  public raycaster = new Raycaster()

  private _interactionRays = [] as Array<THREE.Ray | THREE.Object3D>
  private _hitIntersections = [] as Intersection[]

  constructor(elementOrHTML: Element | string, options: Partial<WebContainer3DOptions> = {}) {
    super()

    if (!options.manager) options.manager = WebLayerManager.instance
    this.options = options as WebContainer3DOptions

    const element = typeof elementOrHTML === 'string' ? toDOM(elementOrHTML) : elementOrHTML

    this.containerElement = WebRenderer.createLayerTree(
      element,
      options as WebContainer3DOptions,
      (event, { target }) => {
        if (event === 'layercreated') {
          const layer = (target as any).layer || new WebLayer3D(target, this)
          if (target === element) {
            layer[ON_BEFORE_UPDATE] = () => this._updateInteractions()
            this.rootLayer = layer
            this.add(layer)
          } else layer.parentWebLayer?.add(layer)
          this.options.onLayerCreate?.(layer)
        } else if (event === 'layermoved') {
          const layer = this.options.manager.layersByElement.get(target)!
          layer.parentWebLayer?.add(layer)
        }
      }
    )

    // @ts-ignore
    this.containerElement['container'] = this

    this.refresh()
    this.update()
  }

  get manager() {
    return this.options.manager
  }

  /**
   * A list of Rays to be used for interaction.
   * Can only be set on a root WebLayer3D instance.
   */
  get interactionRays() {
    return this._interactionRays
  }
  set interactionRays(rays: Array<THREE.Ray | THREE.Object3D>) {
    this._interactionRays = rays
  }

  /**
   * Update all layers until they are rasterized and textures have been uploaded to the GPU
   */
  async updateUntilReady() {
    const intervalHandle = setInterval(() => {
      this.update()
    }, 20)

    this.rootLayer.setNeedsRefresh(true)
    await this.rootLayer.refresh(true)

    clearInterval(intervalHandle)
  }

  /**
   * Update all layers, recursively
   */
  update() {
    this.rootLayer.update(true)
  }

  /**
   * Refresh all layers, recursively
   */
  refresh() {
    this.rootLayer.refresh(true)
  }

  /**
   * Run a query selector on the root layer
   * @param selector
   * @deprecated
   */
  querySelector(selector: string): WebLayer3D | undefined {
    return this.rootLayer.querySelector(selector)
  }

  /** Get the content mesh of the root layer
   * @deprecated
   */
  get contentMesh() {
    return this.rootLayer.contentMesh
  }

  private _previousHoverLayers = new Set<WebLayer3D>()
  private _contentMeshes = [] as THREE.Mesh[]

  private _prepareHitTest = (layer: WebLayer3D) => {
    if (layer.desiredPseudoStates.hover) this._previousHoverLayers.add(layer)
    layer.cursor.visible = false
    layer.desiredPseudoStates.hover = false
    if (layer.contentMesh.visible) this._contentMeshes.push(layer.contentMesh)
  }

  // private _intersectionGetGroupOrder(i:Intersection) {
  //   let o = i.object as THREE.Group&THREE.Object3D
  //   while (o.parent && !o.isGroup) {
  //     o = o.parent as THREE.Group&THREE.Object3D
  //   }
  //   i.groupOrder = o.renderOrder
  // }

  private _intersectionSort(a: Intersection, b: Intersection) {
    const aLayer = a.object.parent as WebLayer3D
    const bLayer = b.object.parent as WebLayer3D
    if (aLayer.depth !== bLayer.depth) {
      return bLayer.depth - aLayer.depth
    }
    return bLayer.index - aLayer.index
  }

  private _updateInteractions() {
    // this.updateWorldMatrix(true, true)

    const prevHover = this._previousHoverLayers
    prevHover.clear()
    this._contentMeshes.length = 0
    this.rootLayer.traverseLayersPreOrder(this._prepareHitTest)

    for (const ray of this._interactionRays) {
      if ('isObject3D' in ray && ray.isObject3D) {
        this.raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2).negate())
      } else this.raycaster.ray.copy(ray as THREE.Ray)
      this._hitIntersections.length = 0
      const intersections = this.raycaster.intersectObjects(
        this._contentMeshes,
        false,
        this._hitIntersections
      ) as Intersection[]
      // intersections.forEach(this._intersectionGetGroupOrder)
      intersections.sort(this._intersectionSort)
      const intersection = intersections[0]
      if (intersection) {
        const layer = intersection.object.parent as WebLayer3D
        layer.cursor.position.copy(intersection.point)
        layer.cursor.visible = true
        layer.desiredPseudoStates.hover = true
        if (!prevHover.has(layer)) {
          layer.setNeedsRefresh()
        }
      }
    }

    for (const layer of prevHover) {
      if (!layer.desiredPseudoStates.hover) {
        layer.setNeedsRefresh()
      }
    }
  }

  /**
   * Perform hit test with ray, or with -Z direction of an Object3D
   * @param ray
   */
  hitTest(ray: THREE.Ray | THREE.Object3D) {
    const raycaster = this.raycaster
    const intersections = this._hitIntersections
    const meshMap = this.options.manager.layersByMesh
    if ('isObject3D' in ray && ray.isObject3D) {
      this.raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2).negate())
    } else {
      this.raycaster.ray.copy(ray as THREE.Ray)
    }
    intersections.length = 0
    raycaster.intersectObject(this, true, intersections)
    // intersections.forEach(this._intersectionGetGroupOrder)
    intersections.sort(this._intersectionSort)
    for (const intersection of intersections) {
      const layer = meshMap!.get(intersection.object as any)
      if (!layer) continue
      const bounds = layer.bounds
      const margin = layer.margin
      const fullWidth = bounds.width + margin.left + margin.right
      const fullHeight = bounds.height + margin.top + margin.bottom
      if (fullWidth * fullHeight === 0) continue
      let target = layer.element as HTMLElement
      const clientX = intersection.uv!.x * fullWidth - margin.left
      const clientY = intersection.uv!.y * fullHeight - margin.top
      traverseChildElements(layer.element, (el) => {
        if (!target.contains(el)) return false
        const elementBoundingRect = getBounds(el, scratchBounds2, layer.element)!
        const { left, top, width, height } = elementBoundingRect
        const right = left + width
        const bottom = top + height
        if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
          target = el as HTMLElement
          return true
        }
        return false // stop traversal down this path
      })
      return { layer, intersection, target }
    }
    return undefined
  }

  /**
   * Remove all DOM elements, remove from scene, and dispose layer resources
   */
  destroy() {
    this.containerElement.remove()
    this.removeFromParent()
    this.rootLayer.dispose()
  }

  /**
   * Export the cache data for this
   */
  async downloadCache(filter?: (layer: WebLayer3D) => boolean) {
    await this.manager.saveStore()
    const states = new Set<string>()
    this.rootLayer.traverseLayersPreOrder((layer) => {
      if (filter) {
        if (!filter(layer)) return
      }
      for (const hash of layer.allStateHashes) states.add(hash)
    })
    const blob = await this.manager.exportCache(Array.from(states))
    downloadBlob(blob, 'web.' + this.rootLayer.element.id + '.cache')
  }
}
