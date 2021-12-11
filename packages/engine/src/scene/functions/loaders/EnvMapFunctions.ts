import { Color, DataTexture, Mesh, MeshStandardMaterial, RGBFormat, sRGBEncoding, Vector3 } from 'three'
import { isClient } from '../../../common/functions/isClient'
import { EnvmapComponent, EnvmapComponentType } from '../../components/EnvmapComponent'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../../constants/EnvMapEnum'
import { convertEquiToCubemap } from '../../classes/ImageUtils'
import { SceneOptions } from '../../systems/SceneObjectSystem'
import { CubemapBakeTypes } from '../../types/CubemapBakeTypes'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineEvents } from '../../../ecs/classes/EngineEvents'
import {
  cubeTextureLoader,
  getPmremGenerator,
  negx,
  negy,
  negz,
  posx,
  posy,
  posz,
  textureLoader
} from '../../constants/Util'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/ComponentNames'

export const SCENE_COMPONENT_ENVMAP = 'envmap'

const tempVector = new Vector3()
const tempColor = new Color()

export const deserializeEnvMap: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  if (!isClient) return

  addComponent(entity, EnvmapComponent, {
    ...json.props,
    envMapSourceColor: new Color(json.props.envMapSourceColor),
    envMapTextureType: json.props.envMapTextureType ?? EnvMapTextureType.Cubemap
  })

  updateEnvMap(entity)
}

export const updateEnvMap: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, EnvmapComponent)

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
      if (!options) return

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
}

export const serializeEnvMap: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, EnvmapComponent) as EnvmapComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_ENVMAP,
    props: {
      type: component.type,
      envMapTextureType: component.envMapTextureType,
      envMapSourceColor: component.envMapSourceColor,
      envMapSourceURL: component.envMapSourceURL,
      envMapIntensity: component.envMapIntensity,
      envMapCubemapBake: component.envMapCubemapBake
    }
  }
}
