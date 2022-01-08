import { RethrownError } from '@xrengine/client-core/src/util/errors'
import Image, { ImageAlphaMode } from '@xrengine/engine/src/scene/classes/Image'

import EditorEvents from '../constants/EditorEvents'
import { resolveMedia } from '../functions/resolveMedia'
import { CacheManager } from '../managers/CacheManager'
import { CommandManager } from '../managers/CommandManager'
import EditorNodeMixin from './EditorNodeMixin'

export default class ImageNode extends EditorNodeMixin(Image) {
  static legacyComponentName = 'image'
  static nodeName = 'Image'
  static initialElementProps = {}
  static async deserialize(json, loadAsync, onError) {
    const node = await super.deserialize(json)
    const { src, projection, controls, alphaMode, alphaCutoff } = json.components.find((c) => c.name === 'image').props
    loadAsync(
      (async () => {
        await node.load(src, onError)
        node.controls = controls || false
        node.alphaMode = alphaMode === undefined ? ImageAlphaMode.Blend : alphaMode
        node.alphaCutoff = alphaCutoff === undefined ? 0.5 : alphaCutoff
        node.projection = projection
      })()
    )
    return node
  }
  constructor() {
    super()
    this._canonicalUrl = ''
    this.controls = true
    this.src = '/static/xrengine.png'
  }
  get src() {
    return this._canonicalUrl
  }
  set src(value) {
    this.load(value).catch(console.error)
  }
  onChange() {
    this.onResize()
  }
  loadTexture(src) {
    return CacheManager.textureCache.get(src)
  }
  async load(src, onError?) {
    const nextSrc = src || ''
    if (nextSrc === this._canonicalUrl && nextSrc !== '') {
      return
    }
    this._canonicalUrl = nextSrc
    this.issues = []
    this._mesh.visible = false
    this.hideErrorIcon()
    try {
      const { url } = await resolveMedia(src)
      await super.load(url)
    } catch (error) {
      this.showErrorIcon()
      const imageError = new RethrownError(`Error loading image ${this._canonicalUrl}`, error)
      if (onError) {
        onError(this, imageError)
      }
      console.error(imageError)
      this.issues.push({ severity: 'error', message: 'Error loading image.' })
    }
    CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
    CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)

    // this.hideLoadingCube();
    return this
  }
  copy(source, recursive = true) {
    super.copy(source, recursive)
    this.controls = source.controls
    this.alphaMode = source.alphaMode
    this.alphaCutoff = source.alphaCutoff
    this._canonicalUrl = source._canonicalUrl
    return this
  }
  async serialize(projectID) {
    return await super.serialize(projectID, {
      image: {
        src: this._canonicalUrl,
        controls: this.controls,
        alphaMode: this.alphaMode,
        alphaCutoff: this.alphaCutoff,
        projection: this.projection
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
    const imageData = {
      src: this._canonicalUrl,
      controls: this.controls,
      alphaMode: this.alphaMode,
      projection: this.projection
    }
    if (this.alphaMode === ImageAlphaMode.Mask) {
      imageData['alphaCutoff'] = this.alphaCutoff
    }
    this.addGLTFComponent('image', imageData)
    this.addGLTFComponent('networked', {
      id: this.uuid
    })
    this.replaceObject()
  }
}
