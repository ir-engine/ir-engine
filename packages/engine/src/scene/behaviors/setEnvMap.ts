import {
  Color,
  CubeTextureLoader,
  DataTexture,
  PMREMGenerator,
  RGBFormat,
  sRGBEncoding,
  TextureLoader,
  Vector3
} from 'three'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { convertEquiToCubemap } from '../../editor/nodes/helper/ImageUtils'
import { ReflectionProbeTypes } from '../../editor/nodes/ReflectionProbeNode'
import { EnvMapProps, EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { SceneObjectSystem } from '../systems/SceneObjectSystem'

export const setEnvMap = (entity, args: EnvMapProps) => {
  if (!isClient) {
    return
  }

  const pmremGenerator = new PMREMGenerator(Engine.renderer)

  switch (args.type) {
    case EnvMapSourceType.Color:
      const src = args.envMapSourceColor
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
      Engine.scene.environment = pmremGenerator.fromEquirectangular(texture).texture
      break

    case EnvMapSourceType.Texture:
      switch (args.envMapTextureType) {
        case EnvMapTextureType.Cubemap:
          const negx = 'negx.jpg'
          const negy = 'negy.jpg'
          const negz = 'negz.jpg'
          const posx = 'posx.jpg'
          const posy = 'posy.jpg'
          const posz = 'posz.jpg'

          new CubeTextureLoader().setPath(args.envMapSourceURL).load(
            [posx, negx, posy, negy, posz, negz],
            (texture) => {
              const EnvMap = pmremGenerator.fromCubemap(texture).texture
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

          break
        case EnvMapTextureType.Equirectangular:
          new TextureLoader().load(args.envMapSourceURL, (texture) => {
            const EnvMap = pmremGenerator.fromEquirectangular(texture).texture
            EnvMap.encoding = sRGBEncoding
            Engine.scene.environment = EnvMap
            texture.dispose()
          })
          break
        default:
          console.log("Can't find type of env texture")
          break
      }

      break

    case EnvMapSourceType.Default:
      const options = args.envMapReflectionProbe
      if (!options) return
      SceneOptions.instance.bpcemOptions.probeScale = options.probeScale
      SceneOptions.instance.bpcemOptions.probePositionOffset = options.probePositionOffset

      EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
        switch (options.reflectionType) {
          case ReflectionProbeTypes.Baked:
            new TextureLoader().load(options.envMapOrigin, (texture) => {
              Engine.scene.environment = convertEquiToCubemap(Engine.renderer, texture, options.resolution).texture
              texture.dispose()
            })

            break
          case ReflectionProbeTypes.Realtime:
            // const map = new CubemapCapturer(Engine.renderer, Engine.scene, options.resolution)
            // const EnvMap = (await map.update(options.probePosition)).cubeRenderTarget.texture
            // Engine.scene.environment = EnvMap
            break
        }
      })
      const offset = args.envMapReflectionProbe.probePositionOffset
      const position = new Vector3(offset.x, offset.y, offset.z)
      SceneOptions.instance.boxProjection = args.envMapReflectionProbe.boxProjection
      SceneOptions.instance.bpcemOptions.probePositionOffset = position
      SceneOptions.instance.bpcemOptions.probeScale = args.envMapReflectionProbe.probeScale
      break
  }

  pmremGenerator.dispose()

  SceneOptions.instance.envMapIntensity = args.envMapIntensity
}
