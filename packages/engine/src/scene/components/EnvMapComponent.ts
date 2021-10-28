import { Color, CubeTextureLoader, DataTexture, Material, Mesh, Object3D, PMREMGenerator, RGBFormat, sRGBEncoding, TextureLoader, Vector3 } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { Engine } from '../../ecs/classes/Engine'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { SceneOptions } from '../systems/SceneObjectSystem'

export type EnvMapDataProps = {
  envMapSourceType?: EnvMapSourceType,
  envMapSourceColor?: string,
  envMapTextureType?: EnvMapTextureType,
  envMapSourceURL?: string,
  envMapIntensity?: number
}

export class EnvMapData implements ComponentData {
  static legacyComponentName = ComponentNames.ENVMAP

  constructor(props: EnvMapDataProps) {
    this._envMapSourceColor = new Color(props.envMapSourceColor)
    this._envMapSourceURL = props.envMapSourceURL || ''
    this._envMapTextureType = props.envMapTextureType || EnvMapTextureType.Cubemap
    this.envMapIntensity = props.envMapIntensity || 1

    this.envMapSourceType = props.envMapSourceType || EnvMapSourceType.Default

    this.pmremGenerator = new PMREMGenerator(Engine.renderer)
  }

  _envMapSourceType: EnvMapSourceType
  _envMapSourceColor: Color
  _envMapSourceURL: string
  _envMapTextureType: EnvMapTextureType
  pmremGenerator: PMREMGenerator

  get envMapSourceColor(): Color {
    return this._envMapSourceColor
  }

  set envMapSourceColor(color: Color) {
    if (this._envMapSourceType === EnvMapSourceType.Color) {
      this._envMapSourceColor = color
      this.updateEnvMapColor()
    }
  }

  get envMapIntensity(): number {
    return SceneOptions.instance.envMapIntensity
  }

  set envMapIntensity(intensity: number) {
    SceneOptions.instance.envMapIntensity = intensity
    Engine.scene.traverse((child: Mesh) => {
      if (Array.isArray(child.material)) {
        child.material.forEach((m: any) => m.envMapIntensity = intensity)
      } else if (child.material) (child.material as any).envMapIntensity = intensity
    })
  }

  get envMapSourceURL(): string {
    return this._envMapSourceURL
  }

  set envMapSourceURL(url: string) {
    if (this._envMapSourceType === EnvMapSourceType.Texture) {
      this._envMapSourceURL = url
      this.loadTexture()
    }
  }

  get envMapTextureType(): EnvMapTextureType {
    return this._envMapTextureType
  }

  set envMapTextureType(type: EnvMapTextureType) {
    if (this._envMapSourceType === EnvMapSourceType.Texture) {
      this._envMapTextureType = type
      this.loadTexture()
    }
  }

  get envMapSourceType(): EnvMapSourceType {
    return this._envMapSourceType
  }

  set envMapSourceType(sourceType: EnvMapSourceType) {
    this._envMapSourceType = sourceType

    switch (sourceType) {
      case EnvMapSourceType.Color:
        this.updateEnvMapColor()
        break;

      case EnvMapSourceType.Texture:
        this.loadTexture()

      default:
        break;
    }
  }

  updateEnvMapColor() {
    const src = this._envMapSourceColor
    const col = new Color(src)
    const resolution = 1
    const data = new Uint8Array(3 * resolution * resolution)
    for (let i = 0; i < resolution * resolution; i++) {
      data[i] = Math.floor(col.r * 255)
      data[i + 1] = Math.floor(col.g * 255)
      data[i + 2] = Math.floor(col.b * 255)
    }
    const texture = new DataTexture(data, resolution, resolution, RGBFormat)
    texture.encoding = sRGBEncoding
    Engine.scene.environment = this.pmremGenerator.fromEquirectangular(texture).texture
  }

  loadTexture() {
    if (this._envMapTextureType === EnvMapTextureType.Cubemap) this.loadCubemapTexture()
    else this.loadEquirectangularTexture()
  }

  loadCubemapTexture() {
    const negx = 'negx.jpg'
    const negy = 'negy.jpg'
    const negz = 'negz.jpg'
    const posx = 'posx.jpg'
    const posy = 'posy.jpg'
    const posz = 'posz.jpg'

    new CubeTextureLoader().setPath(this._envMapSourceURL!).load(
      [posx, negx, posy, negy, posz, negz],
      (texture) => {
        const EnvMap = this.pmremGenerator.fromCubemap(texture).texture
        EnvMap.encoding = sRGBEncoding
        Engine.scene.environment = EnvMap
        texture.dispose()
      },
      (res) => {
        console.log(res)
      },
      (erro) => {
        console.warn('Skybox texture could not be found!', erro)
      }
    )
  }

  loadEquirectangularTexture() {
    new TextureLoader().load(this._envMapSourceURL!, (texture) => {
      const EnvMap = this.pmremGenerator.fromEquirectangular(texture).texture
      EnvMap.encoding = sRGBEncoding
      Engine.scene.environment = EnvMap
      texture.dispose()
    })
  }

  // TODO: Is not done yet
  loadDefaultEnvMap() {
    return
    // const options = args.envMapCubemapBake
    // if (!options) return
    // SceneOptions.instance.bpcemOptions.bakeScale = options.bakeScale!
    // SceneOptions.instance.bpcemOptions.bakePositionOffset = options.bakePositionOffset!

    // EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
    //   switch (options.bakeType) {
    //     case CubemapBakeTypes.Baked:
    //       new TextureLoader().load(options.envMapOrigin, (texture) => {
    //         Engine.scene.environment = convertEquiToCubemap(Engine.renderer, texture, options.resolution).texture
    //         texture.dispose()
    //       })

    //       break
    //     case CubemapBakeTypes.Realtime:
    //       // const map = new CubemapCapturer(Engine.renderer, Engine.scene, options.resolution)
    //       // const EnvMap = (await map.update(options.bakePosition)).cubeRenderTarget.texture
    //       // Engine.scene.environment = EnvMap
    //       break
    //   }
    // })
    // const offset = options.bakePositionOffset!
    // const position = new Vector3(offset.x, offset.y, offset.z)
    // SceneOptions.instance.boxProjection = options.boxProjection!
    // SceneOptions.instance.bpcemOptions.bakePositionOffset = position
    // SceneOptions.instance.bpcemOptions.bakeScale = options.bakeScale!
  }
 

  serialize(): object {
    return {
      envMapSourceType: this._envMapSourceType,
      envMapSourceColor: this._envMapSourceColor,
      envMapTextureType: this._envMapTextureType,
      envMapSourceURL: this._envMapSourceURL,
      envMapIntensity: this.envMapIntensity
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const EnvMapComponent = createMappedComponent<EnvMapData>(
  ComponentNames.ENVMAP
)
