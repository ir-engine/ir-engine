import { Clouds } from '../../scene/classes/Clouds'
import EditorNodeMixin from './EditorNodeMixin'
import DirectionalPlaneHelper from '../../scene/classes/DirectionalPlaneHelper'
import loadTexture from '../functions/loadTexture'

let defaultParticleSprite = null
const defaultParticleUrl = '/editor/cloud.png'

export default class CloudNode extends EditorNodeMixin(Clouds) {
  static legacyComponentName = 'cloud'
  static nodeName = 'Cloud'

  static initialElementProps = {
    src: new URL(defaultParticleUrl, (window as any)?.location).href
  }

  static async deserialize(editor, json, loadAsync?, onError?) {
    const node = await super.deserialize(editor, json)

    const { src, worldScale, dimensions, noiseZoom, noiseOffset, spriteScaleRange, fogColor, fogRange } =
      json.components.find((c) => c.name === 'cloud').props

    node.worldScale.copy(worldScale)
    node.dimensions.copy(dimensions)
    node.noiseZoom.copy(noiseZoom)
    node.noiseOffset.copy(noiseOffset)
    node.spriteScaleRange.copy(spriteScaleRange)
    node.fogColor.copy(fogColor)
    node.fogRange.copy(fogRange)

    loadAsync(
      (async () => {
        await node.load(src, onError)
      })()
    )
    node.updateParticles()

    return node
  }

  static async load(): Promise<void> {
    defaultParticleSprite = await loadTexture(defaultParticleUrl)
    defaultParticleSprite.flipY = false
  }

  constructor(editor) {
    super(editor, defaultParticleSprite)
    this.disableOutline = true
    this._canonicalUrl = ''
    this.helper = new DirectionalPlaneHelper()
    this.helper.visible = false
    this.add(this.helper)
  }

  get src() {
    return this._canonicalUrl
  }

  set src(value) {
    this.load(value).catch(console.error)
  }

  async load(src, onError?) {
    const nextSrc = src || ''
    if (nextSrc === this._canonicalUrl) {
      return
    }

    this._canonicalUrl = nextSrc

    try {
      const { url } = await this.editor.api.resolveMedia(src)
      this.material.uniforms.map.value = await loadTexture(url)
    } catch (error) {
      if (onError) {
        onError(this, error)
      }

      console.error(error)
    }

    return this
  }

  onSelect() {
    this.helper.visible = true
  }

  onDeselect() {
    this.helper.visible = false
  }

  onUpdate(dt) {
    this.update(dt)
  }

  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper)
    }

    super.copy(source, recursive)

    if (recursive) {
      const helperIndex = source.children.indexOf(source.helper)

      if (helperIndex === -1) {
        throw new Error('Source helper could not be found.')
      }

      this.helper = this.children[helperIndex]
    }

    this.src = source._canonicalUrl

    return this
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      cloud: {
        src: this._canonicalUrl,
        worldScale: this.worldScale,
        dimensions: this.dimensions,
        noiseZoom: this.noiseZoom,
        noiseOffset: this.noiseOffset,
        spriteScaleRange: this.spriteScaleRange,
        fogColor: this.fogColor,
        fogRange: this.fogRange
      }
    })
  }

  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('cloud', {
      src: this._canonicalUrl,
      worldScale: this.worldScale,
      dimensions: this.dimensions,
      noiseZoom: this.noiseZoom,
      noiseOffset: this.noiseOffset,
      spriteScaleRange: this.spriteScaleRange,
      fogColor: this.fogColor,
      fogRange: this.fogRange
    })
    this.replaceObject()
  }
}
