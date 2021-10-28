import { CubeTextureLoader, PMREMGenerator, ShaderMaterial, sRGBEncoding, TextureLoader, Color } from 'three'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { Engine } from '../../ecs/classes/Engine'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../../scene/classes/Sky'
import { SkyTypeEnum } from '../constants/SkyBoxShaderProps'

export type SkyboxDataProps = {
  backgroundType?: SkyTypeEnum
  azimuth?: number
  inclination?: number
  mieCoefficient?: number
  mieDirectionalG?: number
  rayleigh?: number
  turbidity?: number
  luminance?: number
  backgroundColor?: string
  equirectangularPath?: string
  cubemapPath?: string
}

export class SkyboxData {
  static legacyComponentName = ComponentNames.SKYBOX

  constructor(obj3d: Sky, props?: SkyboxDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.azimuth = props.azimuth || 0
      this.inclination = props.inclination || 0
      this.mieCoefficient = props.mieCoefficient || 0
      this.mieDirectionalG = props.mieDirectionalG || 0
      this.rayleigh = props.rayleigh || 0
      this.turbidity = props.turbidity || 0
      this.luminance = props.luminance || 0
      this._backgroundColor = '#000000'
      this._equirectangularPath = ''
      this._cubemapPath = ''

      this.backgroundType = props.backgroundType || SkyTypeEnum.SKYBOX
    }
  }

  obj3d: Sky
  _backgroundType: SkyTypeEnum
  _cubemapPath: string
  _equirectangularPath: string
  _backgroundColor: string

  get azimuth(): number {
    return this.obj3d.azimuth
  }

  set azimuth(azimuth: number) {
    this.obj3d.azimuth = azimuth
  }

  get inclination(): number {
    return this.obj3d.inclination
  }

  set inclination(inclination: number) {
    this.obj3d.inclination = inclination
  }

  get mieCoefficient(): number {
    return (this.obj3d.sky.material as ShaderMaterial).uniforms.mieCoefficient.value
  }

  set mieCoefficient(mieCoefficient: number) {
    (this.obj3d.sky.material as ShaderMaterial).uniforms.mieCoefficient.value = mieCoefficient
  }

  get mieDirectionalG(): number {
    return (this.obj3d.sky.material as ShaderMaterial).uniforms.mieDirectionalG.value
  }

  set mieDirectionalG(mieDirectionalG: number) {
    (this.obj3d.sky.material as ShaderMaterial).uniforms.mieDirectionalG.value = mieDirectionalG
  }

  get rayleigh(): number {
    return (this.obj3d.sky.material as ShaderMaterial).uniforms.rayleigh.value
  }

  set rayleigh(rayleigh: number) {
    (this.obj3d.sky.material as ShaderMaterial).uniforms.rayleigh.value = rayleigh
  }

  get turbidity(): number {
    return (this.obj3d.sky.material as ShaderMaterial).uniforms.turbidity.value
  }

  set turbidity(turbidity: number) {
    (this.obj3d.sky.material as ShaderMaterial).uniforms.turbidity.value = turbidity
  }

  get luminance(): number {
    return (this.obj3d.sky.material as ShaderMaterial).uniforms.luminance.value
  }

  set luminance(luminance: number) {
    (this.obj3d.sky.material as ShaderMaterial).uniforms.luminance.value = luminance
  }

  get sunPosition() {
    return (this.obj3d.sky.material as ShaderMaterial).uniforms.sunPosition.value
  }

  get backgroundType(): SkyTypeEnum {
    return this._backgroundType
  }

  set backgroundType(backgroundType: SkyTypeEnum) {
    this._backgroundType = backgroundType
    this.updateBackgroundType()
  }

  get cubemapPath(): string {
    return this._cubemapPath
  }

  set cubemapPath(cubemapPath: string) {
    this._cubemapPath = cubemapPath
    this.updateCubeTexture()
  }

  get equirectangularPath(): string {
    return this._equirectangularPath
  }

  set equirectangularPath(equirectangularPath: string) {
    this._equirectangularPath = equirectangularPath
    this.updateEquirectengularTexture()
  }

  get backgroundColor(): string {
    return this._backgroundColor
  }

  set backgroundColor(backgroundColor: string) {
    this._backgroundColor = backgroundColor
    this.updateBackgroundColor()
  }

  updateBackgroundType() {
    switch (this.backgroundType) {
      case SkyTypeEnum.CUBEMAP:
        this.updateCubeTexture()
        this.obj3d.visible = false
        break

      case SkyTypeEnum.EQUIRECTANGULAR:
        this.updateEquirectengularTexture()
        this.obj3d.visible = false
        break

      case SkyTypeEnum.COLOR:
        this.updateBackgroundColor()
        this.obj3d.visible = false
        break

      case SkyTypeEnum.SKYBOX:
      default:
        this.updateSkyboxTexture()
        this.obj3d.visible = true
    }
  }

  updateCubeTexture() {
    if (this.backgroundType !== SkyTypeEnum.CUBEMAP) return

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
  }

  updateEquirectengularTexture() {
    if (this.backgroundType !== SkyTypeEnum.EQUIRECTANGULAR) return

    const pmremGenerator = new PMREMGenerator(Engine.renderer)

    new TextureLoader().load(this.equirectangularPath, (texture) => {
      texture.encoding = sRGBEncoding
      Engine.scene.background = pmremGenerator.fromEquirectangular(texture).texture
      pmremGenerator.dispose()
    })
  }

  updateBackgroundColor() {
    if (this.backgroundType !== SkyTypeEnum.COLOR) return

    Engine.scene.background = new Color(this.backgroundColor)
  }

  updateSkyboxTexture() {
    if (this.backgroundType !== SkyTypeEnum.SKYBOX) return

    Engine.scene.background = this.obj3d.generateSkybox(Engine.renderer)
  }
}

export const SkyboxComponent = createMappedComponent<SkyboxData>(ComponentNames.SKYBOX)
