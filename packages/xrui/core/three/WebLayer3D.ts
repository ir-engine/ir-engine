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

import {
  BufferAttribute,
  CanvasTexture,
  ClampToEdgeWrapping,
  CompressedTexture,
  DoubleSide,
  InterleavedBufferAttribute,
  LinearFilter,
  LinearMipMapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  Object3D,
  PlaneGeometry,
  RGBADepthPacking,
  Texture,
  TextureLoader,
  Vector3,
  VideoTexture
} from 'three'

import { Bounds, Edges } from '../dom-utils'
import { WebLayer } from '../WebLayer'
import { WebRenderer } from '../WebRenderer'
import { WebContainer3D } from './WebContainer3D'
import { ThreeTextureData } from './WebLayerManager'

export const ON_BEFORE_UPDATE = Symbol('ON_BEFORE_UPDATE')

const scratchVector = new Vector3()

/** Correct UVs to be compatible with `flipY=false` textures. */
function flipY(geometry: PlaneGeometry) {
  const uv = geometry.attributes.uv as BufferAttribute | InterleavedBufferAttribute

  for (let i = 0; i < uv.count; i++) {
    uv.setY(i, 1 - uv.getY(i))
  }

  return geometry
}

export class WebLayer3D extends Object3D {
  static GEOMETRY = new PlaneGeometry(1, 1, 2, 2)
  static FLIPPED_GEOMETRY = flipY(new PlaneGeometry(1, 1, 2, 2))

  static shouldApplyDOMLayout(layer: WebLayer3D) {
    const should = layer.shouldApplyDOMLayout
    if ((should as any) === 'always' || should === true) return true
    if ((should as any) === 'never' || should === false) return false
    if (should === 'auto' && layer.parentWebLayer && layer.parent === layer.parentWebLayer) return true
    // return false
    if (should === 'once') {
      layer.shouldApplyDOMLayout = false
      return true
    }
  }

  private _camera?: THREE.PerspectiveCamera

  constructor(public element: Element, public container: WebContainer3D) {
    super()
    this.name = element.id
    this._webLayer = WebRenderer.getClosestLayer(element)!
    ;(element as any).layer = this

    // this.scalable = this.element.hasAttribute('xr-scalable')
    const applyDomElement = this.element.getAttribute('xr-apply-dom-layout')
    if (applyDomElement) this.shouldApplyDOMLayout = applyDomElement

    // compressed textures need flipped geometry]
    const geometry = this._webLayer.isMediaElement ? WebLayer3D.GEOMETRY : WebLayer3D.FLIPPED_GEOMETRY

    this.contentMesh = new Mesh(
      geometry,
      new MeshBasicMaterial({
        side: DoubleSide,
        depthWrite: false,
        transparent: true,
        alphaTest: 0.001,
        opacity: 1,
        toneMapped: false
      })
    )
    this._boundsMesh = new Mesh(
      geometry,
      new MeshBasicMaterial({
        visible: false,
        opacity: 0
      })
    )

    this.add(this.contentMesh)
    this.add(this._boundsMesh)
    this.cursor.visible = false

    this.matrixAutoUpdate = true

    this.contentMesh.matrixAutoUpdate = true
    this.contentMesh.visible = false
    this.contentMesh['customDepthMaterial'] = this.depthMaterial
    this.contentMesh.onBeforeRender = (renderer, scene, camera) => {
      this._camera = camera as THREE.PerspectiveCamera
    }

    this._boundsMesh.matrixAutoUpdate = true

    this.container.options.manager.layersByElement.set(this.element, this)
    this.container.options.manager.layersByMesh.set(this.contentMesh, this)

    // this.childContentMeshTemplate = this.contentMesh.clone()
  }

  protected _webLayer: WebLayer

  private _localZ = 0
  private _viewZ = 0
  private _renderZ = 0

  private _mediaSrc?: string
  private _mediaTexture?: VideoTexture | Texture

  textures = new Set<Texture>()

  private _previousTexture?: VideoTexture | CompressedTexture | Texture

  private _textureMap = new Map<string, ThreeTextureData>()

  // scalable = false

  get allStateHashes() {
    return this._webLayer.allStateHashes
  }

  get domState() {
    return this._webLayer.currentDOMState
  }

  // characterMap: Map<string, ThreeTextureData> = new Map()

  get texture() {
    const manager = this.container.manager
    const _layer = this._webLayer

    if (_layer.isMediaElement) {
      const media = this.element as HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
      let t = this._mediaTexture
      if (!t || (t.image && (media as any).src !== t.image.src)) {
        if (t) t.dispose()
        t = _layer.isVideoElement
          ? new VideoTexture(media as HTMLVideoElement)
          : _layer.isCanvasElement
          ? new CanvasTexture(media as HTMLCanvasElement)
          : new TextureLoader().load((media as HTMLImageElement).src)
        t.wrapS = ClampToEdgeWrapping
        t.wrapT = ClampToEdgeWrapping
        t.minFilter = LinearFilter // note: media element textures cannot use mipmapping
        if (manager.textureEncoding) t.encoding = manager.textureEncoding
        this._mediaTexture = t
      }
      return t
    }

    const textureHash = this._webLayer.currentDOMState?.texture?.hash

    if (textureHash) {
      if (!this._textureMap.has(textureHash)) this._textureMap.set(textureHash, {})
      const textures = manager.getTexture(textureHash)
      const clonedTextures = this._textureMap.get(textureHash)!
      if (textures.compressedTexture && !clonedTextures.compressedTexture) {
        clonedTextures.canvasTexture?.dispose()
        clonedTextures.canvasTexture = undefined
        clonedTextures.compressedTexture = textures.compressedTexture.clone()
        clonedTextures.compressedTexture.needsUpdate = true
      }
      if (textures.canvasTexture && !clonedTextures.canvasTexture) {
        clonedTextures.canvasTexture = textures.canvasTexture.clone()
        clonedTextures.canvasTexture.needsUpdate = true
      }
      return clonedTextures.compressedTexture ?? clonedTextures.canvasTexture
    }

    return undefined
  }

  // private getCharacterTexture(char: string) {
  //   const manager = this.container.manager
  //   const _layer = this._webLayer
  //   if (_layer.prerasterizedRange.length) {
  //     const hash = this._webLayer.prerasterizedImages.get(char)
  //     const textureData = manager.getTexture(hash!)
  //     console.log(textureData, char)
  //     if (textureData) {
  //       if (!this.characterMap.has(char)) this.characterMap.set(char, textureData)
  //       const clonedTexture = this.characterMap.get(char)!
  //       if (textureData.compressedTexture && !clonedTexture?.compressedTexture) {
  //         clonedTexture?.canvasTexture?.dispose()
  //         clonedTexture.canvasTexture = undefined
  //         clonedTexture.compressedTexture = textureData.compressedTexture.clone()
  //         clonedTexture.compressedTexture.needsUpdate = true
  //       }
  //       if (textureData.canvasTexture && !clonedTexture.canvasTexture) {
  //         clonedTexture.canvasTexture = textureData.canvasTexture.clone()
  //         clonedTexture.canvasTexture.needsUpdate = true
  //       }

  //       return clonedTexture.compressedTexture ?? clonedTexture.canvasTexture
  //     }
  //     return undefined
  //   }
  // }

  contentMesh: Mesh
  // childContentMeshTemplate: Mesh

  /**
   * This non-visible mesh ensures that an adapted layer retains
   * its innerBounds, even if the content mesh is
   * independently adapted.
   */
  private _boundsMesh: Mesh

  cursor = new Object3D()

  /**
   * Allows correct shadow maps
   */
  depthMaterial = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking,
    alphaTest: 0.001
  })

  domLayout = new Object3D()
  domSize = new Vector3(1, 1, 1)

  /**
   * The desired pseudo state (changing this will set needsRefresh to true)
   */
  get desiredPseudoStates() {
    return this._webLayer.desiredPseudoState
  }

  /**
   * Get the hover state
   */
  get pseudoStates() {
    return this._webLayer.currentDOMState?.pseudo
  }

  /**
   * Get the layer depth (distance from this layer's element and the parent layer's element)
   */
  get depth() {
    return this._webLayer.depth
  }

  /**
   *
   */
  get index() {
    return this.parentWebLayer ? this.parentWebLayer.childWebLayers.indexOf(this) : 0
  }

  get needsRefresh() {
    return this._webLayer.needsRefresh
  }

  setNeedsRefresh(recurse = true) {
    this._webLayer.setNeedsRefresh(recurse)
  }

  /** If true, this layer needs to be removed from the scene */
  get needsRemoval() {
    return this._webLayer.needsRemoval
  }

  bounds = new Bounds()
  margin = new Edges()

  get parentWebLayer(): WebLayer3D | undefined {
    return this._webLayer.parentLayer && this.container.manager.layersByElement.get(this._webLayer.parentLayer.element)
  }

  childWebLayers: WebLayer3D[] = []

  /**
   * Specifies whether or not the DOM layout should be applied.
   *
   * When set to `true`, the dom layout should always be applied.
   * When set to `false`, the dom layout should never be applied.
   * When set to `'auto'`, the dom layout should only be applied
   * when the `parentLayer` is the same as the `parent` object.
   *
   * It is the responsibiltiy of the update callback
   * to follow these rules.
   *
   * Defaults to `auto`
   */
  shouldApplyDOMLayout: true | false | string = 'auto'

  /**
   * Refresh from DOM (potentially slow, call only when needed)
   */
  public async refresh(recurse = false): Promise<void> {
    // if (
    //   this.getCharacterTexture(this._webLayer.prerasterizedRange.slice(-1).toString()) != undefined &&
    //   this._webLayer.prerasterizedRange.length
    // ) {
    //   const mesh = this.contentMesh
    //   const characters = this.element.textContent
    //   for (let i = 0; i < characters!.length; i++) {
    //     if (!characters) continue
    //     const currentChar = characters.charAt(i)
    //     if (this.characters[i] != currentChar) {
    //       const texture = this.getCharacterTexture(currentChar)
    //       if (texture) {
    //         mesh.visible = true
    //         const characterMesh = mesh.clone(true)
    //         characterMesh.visible = true
    //         characterMesh.position.setX(-0.25 + 0.0125 * mesh.parent!.children.length)

    //         const material = (this.contentMesh.material as MeshBasicMaterial).clone()
    //         material.map = texture
    //         material.needsUpdate = true
    //         characterMesh.material = material

    //         mesh.parent!.add(characterMesh)
    //         this.characterMeshes[i] = characterMesh
    //         this.characters[i] = currentChar
    //       }
    //     }
    //   }
    // }

    const refreshing = [] as Promise<any>[]
    refreshing.push(this._webLayer.refresh())
    this.childWebLayers.length = 0
    for (const c of this._webLayer.childLayers) {
      const child = this.container.manager.layersByElement.get(WebRenderer.getClosestLayer(c.element)?.element!)
      if (!child) continue
      this.childWebLayers.push(child)
      if (recurse) refreshing.push(child.refresh(recurse))
    }
    return Promise.all(refreshing).then(() => {})
  }

  private updateLayout() {
    this._updateDOMLayout()

    if (this._camera) {
      this._localZ = Math.abs(
        scratchVector.setFromMatrixPosition(this.matrix).z +
          scratchVector.setFromMatrixPosition(this.contentMesh.matrix).z
      )
      this._viewZ = Math.abs(
        this.contentMesh.getWorldPosition(scratchVector).applyMatrix4(this._camera.matrixWorldInverse).z
      )

      let parentRenderZ = this.parentWebLayer ? this.parentWebLayer._renderZ : this._viewZ

      if (this._localZ < 1e-3) {
        // coplanar? use parent renderZ
        this._renderZ = parentRenderZ
      } else {
        this._renderZ = this._viewZ
      }

      this.contentMesh.renderOrder =
        (this.container.options.renderOrderOffset || 0) +
        (1 - Math.log(this._renderZ + 1) / Math.log(this._camera.far + 1)) +
        (this.depth + this.index * 0.001) * 0.0000001
    }
  }

  // private characterMeshes = [] as Mesh[]
  // private characters = [] as string[]

  private updateContent() {
    if (this.parentWebLayer && !this.parentWebLayer.domLayout) return

    const mesh = this.contentMesh

    const texture = this.texture
    const material = mesh.material as THREE.MeshBasicMaterial
    if (texture && material.map !== texture) {
      const contentScale = this.contentMesh.scale
      const aspect = Math.abs(((contentScale.x * this.scale.x) / contentScale.y) * this.scale.y)
      const targetAspect = this.domSize.x / this.domSize.y
      // swap texture when the aspect ratio matches
      if (Math.abs(targetAspect - aspect) < 1e3) {
        material.map = texture
        this.depthMaterial['map'] = texture
        material.needsUpdate = true
        this.depthMaterial.needsUpdate = true
      }
    }

    // handle layer visibility or removal
    const mat = mesh.material as THREE.MeshBasicMaterial
    const isHidden = mat.opacity < 0.005
    if (isHidden) mesh.visible = false
    else if (mat.map) mesh.visible = true
    if (this.needsRemoval && isHidden) {
      if (this.parent) this.parent.remove(this)
      this.dispose()
    }
    this._refreshMediaBounds()
  }

  /** INTERNAL */
  private [ON_BEFORE_UPDATE]() {}

  // private positioned = false

  protected _doUpdate() {
    this[ON_BEFORE_UPDATE]()

    // content must update before layout
    this.updateContent()
    this.updateLayout()

    if (WebLayer3D.shouldApplyDOMLayout(this)) {
      this.position.copy(this.domLayout.position)
      this.quaternion.copy(this.domLayout.quaternion)
      this.scale.copy(this.domLayout.scale)
    }

    this.contentMesh.position.set(0, 0, 0)
    this.contentMesh.scale.copy(this.domSize)
    this.contentMesh.quaternion.set(0, 0, 0, 1)
    this._boundsMesh.position.set(0, 0, 0)
    this._boundsMesh.scale.copy(this.domSize)
    this._boundsMesh.quaternion.set(0, 0, 0, 1)

    if (this.needsRefresh && this.container.options.autoRefresh !== false) this.refresh()

    if (this._previousTexture !== this.texture) {
      if (this.texture) this.container.manager.renderer.initTexture(this.texture)
      this._previousTexture = this.texture
      this.container.options.onLayerPaint?.(this)
    }

    this._webLayer.update()
    this.container.manager.scheduleTasksIfNeeded()
  }

  get pixelRatio() {
    return this._webLayer.pixelRatio
  }

  set pixelRatio(number: number | null) {
    this._webLayer.pixelRatio = number
  }

  get computedPixelRatio() {
    return this._webLayer.computedPixelRatio
  }

  update(recurse = false) {
    if (recurse) this.traverseLayersPreOrder(this._doUpdate)
    else this._doUpdate()
  }

  querySelector(selector: string): WebLayer3D | undefined {
    const element = this.element.querySelector(selector) || this.element.shadowRoot?.querySelector(selector)
    if (element) {
      return this.container.manager.layersByElement.get(element)
    }
    return undefined
  }

  querySelectorAll(selector: string): WebLayer3D[] {
    const elements = this.element.querySelectorAll(selector) || this.element.shadowRoot?.querySelectorAll(selector)
    return Array.from(elements)
      .map<WebLayer3D>((e) => this.container.manager.layersByElement.get(e)!)
      .filter((l) => l)
  }

  traverseLayerAncestors(each: (layer: WebLayer3D) => void) {
    const parentLayer = this.parentWebLayer
    if (parentLayer) {
      parentLayer.traverseLayerAncestors(each)
      each.call(this, parentLayer)
    }
  }

  traverseLayersPreOrder(each: (layer: WebLayer3D) => boolean | void) {
    if (each.call(this, this) === false) return false
    for (const child of this.childWebLayers) {
      if (child.traverseLayersPreOrder(each) === false) return false
    }
    return true
  }

  traverseLayersPostOrder(each: (layer: WebLayer3D) => boolean | void): boolean {
    for (const child of this.childWebLayers) {
      if (child.traverseLayersPostOrder(each) === false) return false
    }
    return each.call(this, this) || true
  }

  dispose() {
    WebRenderer.disposeLayer(this._webLayer)
    for (const t of this.textures) {
      t.dispose()
    }
    for (const child of this.childWebLayers) child.dispose()
  }

  private _refreshMediaBounds() {
    if (this._webLayer.isMediaElement) {
      const isVideo = this._webLayer.isVideoElement

      const domState = this.domState
      if (!domState) return

      const media = this.element as HTMLVideoElement & HTMLImageElement
      const texture = this.texture!
      const computedStyle = getComputedStyle(this.element)
      const { objectFit } = computedStyle
      const { width: viewWidth, height: viewHeight } = this.bounds.copy(domState.bounds)
      const naturalWidth = isVideo ? media.videoWidth : media.naturalWidth
      const naturalHeight = isVideo ? media.videoHeight : media.naturalHeight
      const mediaRatio = naturalWidth / naturalHeight
      const viewRatio = viewWidth / viewHeight
      texture.center.set(0.5, 0.5)
      switch (objectFit) {
        case 'none':
          texture.repeat.set(viewWidth / naturalWidth, viewHeight / naturalHeight).clampScalar(0, 1)
          break
        case 'contain':
        case 'scale-down':
          texture.repeat.set(1, 1)
          if (viewRatio > mediaRatio) {
            const width = this.bounds.height * mediaRatio || 0
            this.bounds.left += (this.bounds.width - width) / 2
            this.bounds.width = width
          } else {
            const height = this.bounds.width / mediaRatio || 0
            this.bounds.top += (this.bounds.height - height) / 2
            this.bounds.height = height
          }
          break
        case 'cover':
          texture.repeat.set(viewWidth / naturalWidth, viewHeight / naturalHeight)
          if (viewRatio < mediaRatio) {
            const width = this.bounds.height * mediaRatio || 0
            this.bounds.left += (this.bounds.width - width) / 2
            this.bounds.width = width
          } else {
            const height = this.bounds.width / mediaRatio || 0
            this.bounds.top += (this.bounds.height - height) / 2
            this.bounds.height = height
          }
          break
        default:
        case 'fill':
          texture.repeat.set(1, 1)
          break
      }
      domState.bounds.copy(this.bounds)
    }
  }

  private _updateDOMLayout() {
    if (this.needsRemoval) {
      return
    }

    const currentState = this._webLayer.currentDOMState

    if (!currentState) return

    const { bounds: currentBounds, margin: currentMargin, cssTransform } = currentState

    const isMedia = this._webLayer.isMediaElement

    this.domLayout.position.set(0, 0, 0)
    this.domLayout.scale.set(1, 1, 1)
    this.domLayout.quaternion.set(0, 0, 0, 1)

    const bounds = this.bounds.copy(currentBounds)
    const margin = this.margin.copy(currentMargin)

    const width = bounds.width
    const height = bounds.height
    const marginLeft = isMedia ? 0 : margin.left
    const marginRight = isMedia ? 0 : margin.right
    const marginTop = isMedia ? 0 : margin.top
    const marginBottom = isMedia ? 0 : margin.bottom
    const fullWidth = width + marginLeft + marginRight
    const fullHeight = height + marginTop + marginBottom
    const pixelSize = 1 / this.container.manager.pixelsPerMeter

    this.domSize.set(Math.max(pixelSize * fullWidth, 10e-6), Math.max(pixelSize * fullHeight, 10e-6), 1)

    const parentLayer = this.parentWebLayer
    if (!parentLayer) return

    const parentBounds = parentLayer.bounds
    const parentMargin = parentLayer.margin
    const parentFullWidth = parentBounds.width + parentMargin.left + parentMargin.right
    const parentFullHeight = parentBounds.height + parentMargin.bottom + parentMargin.top
    const parentLeftEdge = -parentFullWidth / 2 + parentMargin.left
    const parentTopEdge = parentFullHeight / 2 - parentMargin.top

    this.domLayout.position.set(
      pixelSize * (parentLeftEdge + fullWidth / 2 + bounds.left - marginLeft),
      pixelSize * (parentTopEdge - fullHeight / 2 - bounds.top + marginTop),
      0
    )

    if (cssTransform) {
      this.domLayout.updateMatrix()
      this.domLayout.matrix.multiply(cssTransform)
      this.domLayout.matrix.decompose(this.domLayout.position, this.domLayout.quaternion, this.domLayout.scale)
    }
  }
}
