import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Sky } from '@xrengine/engine/src/scene/classes/Sky'
import { SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyTypeEnum'
import { SkyboxComponentType } from '@xrengine/engine/src/scene/components/SkyboxComponent'
import { Color, CubeTextureLoader, Mesh, PMREMGenerator, sRGBEncoding, TextureLoader } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import SceneNode from './SceneNode'

export default class SkyboxNode extends EditorNodeMixin(Sky) {
  static legacyComponentName = 'skybox'
  static disableTransform = true
  static ignoreRaycast = true
  static nodeName = 'Skybox'

  backgroundType = SkyTypeEnum.skybox
  equirectangularPath = '/hdr/city.jpg'
  cubemapPath = '/cubemap/'
  backgroundColor = '#000000'

  constructor() {
    super()
  }

  static canAddNode() {
    return (Engine.scene as any as SceneNode).findNodeByType(SkyboxNode) === null
  }

  async serialize(projectID) {
    const skybox: SkyboxComponentType = {
      backgroundColor: this.backgroundColor,
      equirectangularPath: this.equirectangularPath,
      cubemapPath: this.cubemapPath,
      backgroundType: this.backgroundType,
      skyboxProps: {
        turbidity: this.turbidity,
        rayleigh: this.rayleigh,
        luminance: this.luminance,
        mieCoefficient: this.mieCoefficient,
        mieDirectionalG: this.mieDirectionalG,
        inclination: this.inclination,
        azimuth: this.azimuth
      }
    }

    return await super.serialize(projectID, { skybox })
  }

  static async deserialize(json) {
    const node = (await super.deserialize(json)) as SkyboxNode
    const skybox = json.components.find((c) => c.name === 'skybox')
    const prop = skybox.props as SkyboxComponentType
    if (prop.skyboxProps) {
      node.backgroundColor = prop.backgroundColor
      node.equirectangularPath = prop.equirectangularPath
      node.cubemapPath = prop.cubemapPath
      node.backgroundType = prop.backgroundType
      node.turbidity = prop.skyboxProps.turbidity
      node.rayleigh = prop.skyboxProps.rayleigh
      node.luminance = prop.skyboxProps.luminance
      node.mieCoefficient = prop.skyboxProps.mieCoefficient
      node.mieDirectionalG = prop.skyboxProps.mieDirectionalG
      node.inclination = prop.skyboxProps.inclination
      node.azimuth = prop.skyboxProps.azimuth
    }
    node.updateSunPosition()

    return node
  }

  onChange() {
    this.setUpBackground(this.backgroundType)
  }

  onRemove() {
    Engine.scene.background = new Color('black')
  }

  prepareForExport() {
    super.prepareForExport()
    const skybox: SkyboxComponentType = {
      backgroundColor: this.backgroundColor,
      equirectangularPath: this.equirectangularPath,
      cubemapPath: this.cubemapPath,
      backgroundType: this.backgroundType,
      skyboxProps: {
        turbidity: this.turbidity,
        rayleigh: this.rayleigh,
        luminance: this.luminance,
        mieCoefficient: this.mieCoefficient,
        mieDirectionalG: this.mieDirectionalG,
        inclination: this.inclination,
        azimuth: this.azimuth
      }
    }
    this.addGLTFComponent('skybox', skybox)
    this.replaceObject()
  }

  setUpBackground(type: SkyTypeEnum) {
    if ((Engine.scene?.background as any)?.dispose) (Engine.scene.background as any).dispose()
    ;(this.sky as Mesh).visible = false

    switch (type) {
      case SkyTypeEnum.color:
        Engine.scene.background = new Color(this.backgroundColor)
        break

      case SkyTypeEnum.cubemap:
        const negx = 'negx.jpg'
        const negy = 'negy.jpg'
        const negz = 'negz.jpg'
        const posx = 'posx.jpg'
        const posy = 'posy.jpg'
        const posz = 'posz.jpg'
        new CubeTextureLoader().setPath(this.cubemapPath).load(
          [posx, negx, posy, negy, posz, negz],
          (texture) => {
            texture.encoding = sRGBEncoding
            Engine.scene.background = texture
          },
          (res) => {
            console.log(res)
          },
          (erro) => {
            console.warn('Skybox texture could not be found!', erro)
          }
        )
        break

      case SkyTypeEnum.equirectangular:
        new TextureLoader().load(this.equirectangularPath, (texture) => {
          texture.encoding = sRGBEncoding
          Engine.scene.background = new PMREMGenerator(Engine.renderer).fromEquirectangular(texture).texture
        })
        break
      default:
        ;(this.sky as Mesh).visible = true
        Engine.scene.background = this.generateSkybox(Engine.renderer)
        console.log('setUpBackground', Engine.scene.background)
        break
    }
  }
}
