import { Ocean } from '../../scene/classes/Ocean'
import EditorNodeMixin from './EditorNodeMixin'
import DirectionalPlaneHelper from '../../scene/classes/DirectionalPlaneHelper'
import loadTexture from '../functions/loadTexture'
import { TGALoader } from '../../assets/loaders/tga/TGALoader'
import { TextureLoader } from 'three'

const defaultNormalMapUrl = '/ocean/water_normal.tga'
const defaultDistortionMapUrl = '/ocean/water_distortion.tga'
const defaultEnvMappUrl = '/hdr/equirectangular/texture222.jpg'

export default class OceanNode extends EditorNodeMixin(Ocean) {
  static legacyComponentName = 'ocean'
  static nodeName = 'Ocean'

  static initialElementProps = {
    normalMapPath: new URL(defaultNormalMapUrl, (window as any)?.location).href,
    distortionMapPath: new URL(defaultDistortionMapUrl, (window as any)?.location).href,
    envMapPath: new URL(defaultEnvMappUrl, (window as any)?.location).href
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      ocean: {
        normalMapPath: this._normalMapPath,
        distortionMapPath: this._distortionMapPath,
        envMapPath: this._envMapPath
      }
    })
  }

  static async deserialize(editor, json, loadAsync?, onError?): Promise<OceanNode> {
    const node = (await super.deserialize(editor, json)) as OceanNode

    const { normalMapPath, distortionMapPath, envMapPath } = json.components.find((c) => c.name === 'ocean').props

    const mesh = node as any as OceanNode

    mesh.normalMapPath = normalMapPath
    mesh.distortionMapPath = distortionMapPath
    mesh.envMapPath = envMapPath

    return node
  }

  constructor(editor) {
    super(editor)
    this.disableOutline = true
    this.helper = new DirectionalPlaneHelper()
    this.helper.visible = false
    this.add(this.helper)

    this._normalMapPath = ''
    this._distortionMapPath = ''
    this._envMapPath = ''

    const mesh = this as any as Ocean

    // Base mesh defaults
    mesh.color.setRGB(0.158628, 0.465673, 0.869792)
    mesh.opacityRange.set(0.6, 0.9)
    mesh.shallowWaterColor.setRGB(0.190569, 0.765519, 0.869792)
    mesh.waveScale.set(0.25, 0.25)
    mesh.waveDistortionFactor = 7.0
    mesh.waveDistortionSpeed.set(0.08, 0.08)
    mesh.waveSpeed.set(0.08, 0.0)
    mesh.waveUVFactor = 12.0
    mesh.shininess = 40
    mesh.reflectivity = 0.25
    mesh.bigWaveScale = 0.7
    mesh.bigWaveUVScale.set(1.5, 1.5)
    mesh.bigWaveSpeed.set(0.02, 0.0)
    mesh.shallowToDeepDistance = 0.1
    mesh.opacityFadeDistance = 0.12
  }

  get normalMapPath() {
    return this._normalMapPath
  }

  set normalMapPath(value: string) {
    this._normalMapPath = value

    this.load(value)
      .then((map) => {
        map && this.setNormalMap(map)
      })
      .catch(console.error)
  }

  get distortionMapPath() {
    return this._distortionMapPath
  }

  set distortionMapPath(value: string) {
    this._distortionMapPath = value
    this.load(value)
      .then((map) => {
        map && this.setDistortionMap(map)
      })
      .catch(console.error)
  }

  get envMapPath() {
    return this._envMapPath
  }

  set envMapPath(value: string) {
    this._envMapPath = value
    this.load(value)
      .then((map) => {
        map && this.setEnvMap(map)
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
    this.addGLTFComponent('ocean', {
      normalMapPath: this._normalMapPath,
      distortionMapPath: this._distortionMapPath,
      envMapPath: this._envMapPath
    })
    this.replaceObject()
  }
}
