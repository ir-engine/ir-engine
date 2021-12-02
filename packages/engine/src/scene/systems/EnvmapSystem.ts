import {
  Color,
  CubeTextureLoader,
  sRGBEncoding,
  TextureLoader,
  PMREMGenerator,
  DataTexture,
  RGBFormat,
  Vector3,
  Mesh,
  MeshStandardMaterial
} from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { convertEquiToCubemap } from '../classes/ImageUtils'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'
import { CubemapBakeTypes } from '../types/CubemapBakeTypes'
import { SceneOptions } from './SceneObjectSystem'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function Envmap(_: World): Promise<System> {
  const envmapQuery = defineQuery([EnvmapComponent])

  const negx = 'negx.jpg'
  const negy = 'negy.jpg'
  const negz = 'negz.jpg'
  const posx = 'posx.jpg'
  const posy = 'posy.jpg'
  const posz = 'posz.jpg'
  const tempVector = new Vector3()
  const tempColor = new Color()

  const cubeTextureLoader = new CubeTextureLoader()
  const textureLoader = new TextureLoader()
  let pmremGenerator: PMREMGenerator

  const getPmremGenerator = (): PMREMGenerator => {
    if (!pmremGenerator) pmremGenerator = new PMREMGenerator(Engine.renderer)
    return pmremGenerator
  }

  return () => {
    for (const entity of envmapQuery()) {
      const component = getComponent(entity, EnvmapComponent)

      if (!component.dirty) continue

      switch (component.type) {
        case EnvMapSourceType.Color:
          const col = component.envMapSourceColor ?? tempColor
          const resolution = 1
          const data = new Uint8Array(3 * resolution * resolution)

          for (let i = 0; i < resolution * resolution; i++) {
            data[i] = Math.floor(col.r * 255)
            data[i + 1] = Math.floor(col.g * 255)
            data[i + 2] = Math.floor(col.b * 255)
          }

          const texture = new DataTexture(data, resolution, resolution, RGBFormat)
          texture.encoding = sRGBEncoding

          Engine.scene.environment = getPmremGenerator().fromEquirectangular(texture).texture
          break

        case EnvMapSourceType.Texture:
          switch (component.envMapTextureType) {
            case EnvMapTextureType.Cubemap:
              cubeTextureLoader.setPath(component.envMapSourceURL).load(
                [posx, negx, posy, negy, posz, negz],
                (texture) => {
                  const EnvMap = getPmremGenerator().fromCubemap(texture).texture
                  EnvMap.encoding = sRGBEncoding
                  Engine.scene.environment = EnvMap
                  component.errorWhileLoading = false
                  texture.dispose()
                },
                (_res) => {
                  /* console.log(_res) */
                },
                (error) => {
                  component.errorWhileLoading = true
                  console.warn('Skybox texture could not be found!', error)
                }
              )
              break

            case EnvMapTextureType.Equirectangular:
              textureLoader.load(
                component.envMapSourceURL,
                (texture) => {
                  const EnvMap = getPmremGenerator().fromEquirectangular(texture).texture
                  EnvMap.encoding = sRGBEncoding
                  Engine.scene.environment = EnvMap
                  component.errorWhileLoading = false
                  texture.dispose()
                },
                (_res) => {
                  /* console.log(_res) */
                },
                (error) => {
                  component.errorWhileLoading = true
                  console.warn('Skybox texture could not be found!', error)
                }
              )
              break
          }
          break

        case EnvMapSourceType.Default:
          const options = component.envMapCubemapBake
          if (!options) continue

          SceneOptions.instance.bpcemOptions.bakeScale = options.bakeScale!
          SceneOptions.instance.bpcemOptions.bakePositionOffset = options.bakePositionOffset!

          EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
            switch (options.bakeType) {
              case CubemapBakeTypes.Baked:
                textureLoader.load(options.envMapOrigin, (texture) => {
                  Engine.scene.environment = convertEquiToCubemap(Engine.renderer, texture, options.resolution).texture
                  texture.dispose()
                })

                break
              case CubemapBakeTypes.Realtime:
                // const map = new CubemapCapturer(Engine.renderer, Engine.scene, options.resolution)
                // const EnvMap = (await map.update(options.bakePosition)).cubeRenderTarget.texture
                // Engine.scene.environment = EnvMap
                break
            }
          })

          const offset = options.bakePositionOffset!
          tempVector.set(offset.x, offset.y, offset.z)

          SceneOptions.instance.boxProjection = options.boxProjection!
          SceneOptions.instance.bpcemOptions.bakePositionOffset = tempVector
          SceneOptions.instance.bpcemOptions.bakeScale = options.bakeScale!
          break

        default:
          break
      }

      if (SceneOptions.instance.envMapIntensity !== component.envMapIntensity) {
        SceneOptions.instance.envMapIntensity = component.envMapIntensity
        Engine.scene.traverse((obj: Mesh) => {
          if (!obj.material) return

          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: MeshStandardMaterial) => (m.envMapIntensity = component.envMapIntensity))
          } else {
            ;(obj.material as MeshStandardMaterial).envMapIntensity = component.envMapIntensity
          }
        })
      }

      component.dirty = false
    }
  }
}
