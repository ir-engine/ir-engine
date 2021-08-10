import { Ocean } from '../../scene/classes/Ocean'
import EditorNodeMixin from './EditorNodeMixin'
import DirectionalPlaneHelper from '../../scene/classes/DirectionalPlaneHelper'
import loadTexture from '../functions/loadTexture'
import { TGALoader } from '../../assets/loaders/tga/TGALoader'
import { TextureLoader } from 'three'

let defaultParticleSprite = null
const defaultNormalMapUrl = '/ocean/water_normal.tga'
const defaultDistortionMapUrl = '/ocean/water_distortion.tga'
const defaultEnvMapPath = '/ocean/env/'

export default class OceanNode extends EditorNodeMixin(Ocean) {
  static legacyComponentName = 'ocean'
  static nodeName = 'Ocean'

  static initialElementProps = {
    normalMapPath: new URL(defaultNormalMapUrl, (window as any)?.location).href,
    distortionMapPath: new URL(defaultDistortionMapUrl, (window as any)?.location).href
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      ocean: {}
    })
  }

  static async deserialize(editor, json, loadAsync?, onError?): Promise<OceanNode> {
    const node = (await super.deserialize(editor, json)) as OceanNode

    const { src } = json.components.find((c) => c.name === 'ocean').props

    // const mesh = node as any as OceanNode
    // mesh.worldScale.copy(worldScale)
    // mesh.dimensions.copy(dimensions)
    // mesh.noiseZoom.copy(noiseZoom)
    // mesh.noiseOffset.copy(noiseOffset)
    // mesh.spriteScaleRange.copy(spriteScaleRange)
    // mesh.fogColor.set(fogColor)
    // mesh.fogRange.copy(fogRange)

    loadAsync(
      (async () => {
        await node.load(src, onError)
      })()
    )

    return node
  }

  constructor(editor) {
    super(editor, defaultParticleSprite)
    this.disableOutline = true
    this.helper = new DirectionalPlaneHelper()
    this.helper.visible = false
    this.add(this.helper)

    this.normalMapPath = ''
    this.distortionMapPath = ''

    // const mesh = this as any as Ocean

    // Base mesh defaults
  }

  get normalMapPath() {
    return this.normalMapPath
  }

  set normalMapPath(value) {
    this.load(value)
      .then((map) => {
        map && this.setNormalMap(map)
      })
      .catch(console.error)
  }

  get distortionMapPath() {
    return this.distortionMapPath
  }

  set distortionMapPath(value) {
    this.load(value)
      .then((map) => {
        map && this.setDistortionMap(map)
      })
      .catch(console.error)
  }

  async load(src, onError?) {
    if (src === '') return

    try {
      const { url } = await this.editor.api.resolveMedia(src)
      const loader = src.endsWith('tga') ? new TGALoader() : new TextureLoader()
      return loadTexture(url, loader)
    } catch (error) {
      onError && onError(this, error)
      console.error(error)
    }
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
