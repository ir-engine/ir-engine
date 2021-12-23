import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Color, sRGBEncoding } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  hasComponent,
  removeComponent
} from '../../../ecs/functions/ComponentFunctions'
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
  backgroundColor: 0,
  equirectangularPath: '/hdr/city.jpg',
  cubemapPath: '/hdr/cubemap/Bridge2/',
  backgroundType: 3,
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

export const deserializeSkybox: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  if (isClient) {
    json.props.backgroundColor = new Color(json.props.backgroundColor)
    addComponent(entity, SkyboxComponent, json.props)
    addComponent(entity, DisableTransformTagComponent, {})
    addComponent(entity, IgnoreRaycastTagComponent, {})
    if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_SKYBOX)
    updateSkybox(entity)
  }
}

export const updateSkybox: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, SkyboxComponent)
  const hasSkyObject = hasComponent(entity, Object3DComponent)

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
      const sky = hasSkyObject
        ? (getComponent(entity, Object3DComponent).value as Sky)
        : (addComponent(entity, Object3DComponent, { value: new Sky() }).value as Sky)

      sky.azimuth = component.skyboxProps.azimuth
      sky.inclination = component.skyboxProps.inclination

      const uniforms = Sky.material.uniforms
      uniforms.mieCoefficient.value = component.skyboxProps.mieCoefficient
      uniforms.mieDirectionalG.value = component.skyboxProps.mieDirectionalG
      uniforms.rayleigh.value = component.skyboxProps.rayleigh
      uniforms.turbidity.value = component.skyboxProps.turbidity
      uniforms.luminance.value = component.skyboxProps.luminance
      setSkyDirection(uniforms.sunPosition.value)
      Engine.scene.background = sky.generateSkybox(Engine.renderer)
      break

    default:
      break
  }

  if (hasSkyObject && component.backgroundType !== SkyTypeEnum.skybox) {
    removeComponent(entity, Object3DComponent)
  }
}

export const serializeSkybox: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SkyboxComponent) as SkyboxComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_SKYBOX,
    props: {
      backgroundColor: component.backgroundColor?.getHex(),
      equirectangularPath: component.equirectangularPath,
      cubemapPath: component.cubemapPath,
      backgroundType: component.backgroundType,
      skyboxProps: component.skyboxProps
    }
  }
}

export const setSkyDirection = (direction: Vector3) => {
  Engine.csm?.lightDirection.copy(direction).multiplyScalar(-1)
}

export const shouldDeserializeSkybox: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(SkyboxComponent) <= 0
}
