import { Ocean } from '@xrengine/engine/src/scene/classes/Ocean'
import EditorNodeMixin from './EditorNodeMixin'
import DirectionalPlaneHelper from '@xrengine/engine/src/scene/classes/DirectionalPlaneHelper'
import { Color, Vector2 } from 'three'

const defaultNormalMapUrl = '/ocean/water_normal.tga'
const defaultDistortionMapUrl = '/ocean/water_distortion.tga'
const defaultEnvMappUrl = '/hdr/equirectangular/texture222.jpg'

export default class OceanNode extends EditorNodeMixin(Ocean) {
  static legacyComponentName = 'ocean'
  static nodeName = 'Ocean'

  static initialElementProps = {
    normalMap: new URL(defaultNormalMapUrl, (window as any)?.location).href,
    distortionMap: new URL(defaultDistortionMapUrl, (window as any)?.location).href,
    envMap: new URL(defaultEnvMappUrl, (window as any)?.location).href,

    color: new Color(0.158628, 0.465673, 0.869792),
    opacityRange: new Vector2(0.6, 0.9),
    opacityFadeDistance: 0.12,
    shallowToDeepDistance: 0.1,
    shallowWaterColor: new Color(0.190569, 0.765519, 0.869792),
    waveScale: new Vector2(0.25, 0.25),
    waveSpeed: new Vector2(0.08, 0.0),
    waveTiling: 12.0,
    waveDistortionTiling: 7.0,
    waveDistortionSpeed: new Vector2(0.08, 0.08),
    shininess: 40,
    reflectivity: 0.25,
    bigWaveHeight: 0.7,
    bigWaveTiling: new Vector2(1.5, 1.5),
    bigWaveSpeed: new Vector2(0.02, 0.0),
    foamSpeed: new Vector2(0.05, 0.0),
    foamTiling: 2.0
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      ocean: {
        normalMap: this.normalMap,
        distortionMap: this.distortionMap,
        envMap: this.envMap,
        color: this.color,
        opacityRange: this.opacityRange,
        opacityFadeDistance: this.opacityFadeDistance,
        shallowToDeepDistance: this.shallowToDeepDistance,
        shallowWaterColor: this.shallowWaterColor,
        waveScale: this.waveScale,
        waveSpeed: this.waveSpeed,
        waveTiling: this.waveTiling,
        waveDistortionTiling: this.waveDistortionTiling,
        waveDistortionSpeed: this.waveDistortionSpeed,
        shininess: this.shininess,
        reflectivity: this.reflectivity,
        bigWaveHeight: this.bigWaveHeight,
        bigWaveTiling: this.bigWaveTiling,
        bigWaveSpeed: this.bigWaveSpeed,
        foamSpeed: this.foamSpeed,
        foamTiling: this.foamTiling
      }
    })
  }

  static async deserialize(json, loadAsync?, onError?): Promise<OceanNode> {
    const node = (await super.deserialize(json)) as OceanNode
    const props = json.components.find((c) => c.name === 'ocean').props
    Object.assign(node, props)
    return node
  }

  constructor() {
    super()
    this.userData.disableOutline = true
    this.helper = new DirectionalPlaneHelper()
    this.helper.visible = false
    this.add(this.helper)
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

    return this
  }

  prepareForExport() {
    super.prepareForExport()
    this.addGLTFComponent('ocean', {
      normalMap: this.normalMap,
      distortionMap: this.distortionMap,
      envMap: this.envMap,
      color: this.color,
      opacityRange: this.opacityRange,
      opacityFadeDistance: this.opacityFadeDistance,
      shallowToDeepDistance: this.shallowToDeepDistance,
      shallowWaterColor: this.shallowWaterColor,
      waveScale: this.waveScale,
      waveSpeed: this.waveSpeed,
      waveTiling: this.waveTiling,
      waveDistortionTiling: this.waveDistortionTiling,
      waveDistortionSpeed: this.waveDistortionSpeed,
      shininess: this.shininess,
      reflectivity: this.reflectivity,
      bigWaveHeight: this.bigWaveHeight,
      bigWaveTiling: this.bigWaveTiling,
      bigWaveSpeed: this.bigWaveSpeed,
      foamSpeed: this.foamSpeed,
      foamTiling: this.foamTiling
    })
    this.replaceObject()
  }
}
