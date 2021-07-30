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

  static async deserialize(editor, json, loadAsync?, onError?): Promise<CloudNode> {
    const node = (await super.deserialize(editor, json)) as CloudNode

    const { src, worldScale, dimensions, noiseZoom, noiseOffset, spriteScaleRange, fogColor, fogRange } =
      json.components.find((c) => c.name === 'cloud').props

    const mesh = node as any as Clouds
    mesh.worldScale.copy(worldScale)
    mesh.dimensions.copy(dimensions)
    mesh.noiseZoom.copy(noiseZoom)
    mesh.noiseOffset.copy(noiseOffset)
    mesh.spriteScaleRange.copy(spriteScaleRange)
    mesh.fogColor.set(fogColor)
    mesh.fogRange.copy(fogRange)

    loadAsync(
      (async () => {
        await node.load(src, onError)
      })()
    )

    mesh.updateParticles()

    return node
  }

  constructor(editor) {
    super(editor, defaultParticleSprite)
    this.disableOutline = true
    this._canonicalUrl = ''
    this.helper = new DirectionalPlaneHelper()
    this.helper.visible = false
    this.add(this.helper)

    const mesh = this as any as Clouds

    // Base mesh defaults
    mesh.worldScale.set(1000, 150, 1000)
    mesh.dimensions.set(8, 4, 8)
    mesh.noiseZoom.set(7, 11, 7)
    mesh.noiseOffset.set(0, 4000, 3137)
    mesh.spriteScaleRange.set(50, 100)
    mesh.fogColor.set(0x4584b4)
    mesh.fogRange.set(-100, 3000)
    mesh.updateParticles()
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
      this.setTexture(await loadTexture(url))
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
