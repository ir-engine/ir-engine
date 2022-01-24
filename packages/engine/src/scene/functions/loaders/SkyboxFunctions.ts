import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, Object3D, sRGBEncoding } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getComponentCountOfType } from '../../../ecs/functions/ComponentFunctions'
import { DisableTransformTagComponent } from '../../../transform/components/DisableTransformTagComponent'
import { Sky } from '../../classes/Sky'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SkyboxComponent, SkyboxComponentType } from '../../components/SkyboxComponent'
import { SkyTypeEnum } from '../../constants/SkyTypeEnum'
import {
  cubeTextureLoader,
  posx,
  negx,
  posy,
  negy,
  posz,
  negz,
  textureLoader,
  getPmremGenerator
} from '../../constants/Util'
import { Vector3 } from 'three'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { IgnoreRaycastTagComponent } from '../../components/IgnoreRaycastTagComponent'

export const SCENE_COMPONENT_SKYBOX = 'skybox'
export const SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES = {
  backgroundColor: 0x000000,
  equirectangularPath: '',
  cubemapPath: '/hdr/cubemap/skyboxsun25deg/',
  backgroundType: 1,
  skyboxProps: {
    turbidity: 10,
    rayleigh: 1,
    luminance: 1,
    mieCoefficient: 0.004999999999999893,
    mieDirectionalG: 0.99,
    inclination: 0.10471975511965978,
    azimuth: 0.16666666666666666
  }
}

export const deserializeSkybox: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<SkyboxComponentType>
) => {
  if (isClient) {
    const props = parseSkyboxProperties(json.props)
    addComponent(entity, Object3DComponent, { value: new Object3D() })
    addComponent(entity, SkyboxComponent, props)
    addComponent(entity, DisableTransformTagComponent, {})
    addComponent(entity, IgnoreRaycastTagComponent, {})
    if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SKYBOX)
    updateSkybox(entity)
  }
}

export const updateSkybox: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, SkyboxComponent)

  switch (component.backgroundType) {
    case SkyTypeEnum.color:
      Engine.scene.background = component.backgroundColor
      break

    case SkyTypeEnum.cubemap:
      cubeTextureLoader.setPath(component.cubemapPath).load(
        [posx, negx, posy, negy, posz, negz],
        (texture) => {
          texture.encoding = sRGBEncoding
          Engine.scene.background = texture
        },
        (_res) => {
          /* console.log(_res) */
        },
        (erro) => console.warn('Skybox texture could not be found!', erro)
      )
      break

    case SkyTypeEnum.equirectangular:
      textureLoader.load(component.equirectangularPath, (texture) => {
        texture.encoding = sRGBEncoding
        Engine.scene.background = getPmremGenerator().fromEquirectangular(texture).texture
      })
      break

    case SkyTypeEnum.skybox:
      if (!component.sky) component.sky = new Sky()

      component.sky.azimuth = component.skyboxProps.azimuth
      component.sky.inclination = component.skyboxProps.inclination

      component.sky.mieCoefficient = component.skyboxProps.mieCoefficient
      component.sky.mieDirectionalG = component.skyboxProps.mieDirectionalG
      component.sky.rayleigh = component.skyboxProps.rayleigh
      component.sky.turbidity = component.skyboxProps.turbidity
      component.sky.luminance = component.skyboxProps.luminance

      setSkyDirection(component.sky.sunPosition)
      Engine.scene.background = getPmremGenerator().fromCubemap(
        component.sky.generateSkyboxTextureCube(Engine.renderer)
      ).texture

      break

    default:
      break
  }

  if (component.backgroundType !== SkyTypeEnum.skybox && component.sky) {
    component.sky = undefined
  }
}

export const serializeSkybox: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SkyboxComponent) as SkyboxComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_SKYBOX,
    props: {
      backgroundColor: component.backgroundColor.getHex(),
      equirectangularPath: component.equirectangularPath,
      cubemapPath: component.cubemapPath,
      backgroundType: component.backgroundType,
      skyboxProps: component.skyboxProps
    }
  }
}

const setSkyDirection = (direction: Vector3): void => {
  Engine.csm?.lightDirection.copy(direction).multiplyScalar(-1)
}

export const shouldDeserializeSkybox: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(SkyboxComponent) <= 0
}

const parseSkyboxProperties = (props): SkyboxComponentType => {
  return {
    backgroundColor: new Color(props.backgroundColor ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.backgroundColor),
    equirectangularPath: props.equirectangularPath ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.equirectangularPath,
    cubemapPath: props.cubemapPath ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.cubemapPath,
    backgroundType: props.backgroundType ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.backgroundType,
    skyboxProps: props.skyboxProps
      ? {
          turbidity: props.skyboxProps.turbidity ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps.turbidity,
          rayleigh: props.skyboxProps.rayleigh ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps.rayleigh,
          luminance: props.skyboxProps.luminance ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps.luminance,
          mieCoefficient:
            props.skyboxProps.mieCoefficient ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps.mieCoefficient,
          mieDirectionalG:
            props.skyboxProps.mieDirectionalG ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps.mieDirectionalG,
          inclination: props.skyboxProps.inclination ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps.inclination,
          azimuth: props.skyboxProps.azimuth ?? SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps.azimuth
        }
      : SCENE_COMPONENT_SKYBOX_DEFAULT_VALUES.skyboxProps
  }
}
