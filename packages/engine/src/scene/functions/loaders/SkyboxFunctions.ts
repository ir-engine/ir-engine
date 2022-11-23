import { Color, sRGBEncoding } from 'three'
import { Vector3 } from 'three'

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
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { Sky } from '../../classes/Sky'
import { SkyboxComponent } from '../../components/SkyboxComponent'
import { SkyTypeEnum } from '../../constants/SkyTypeEnum'
import { getPmremGenerator, loadCubeMapTexture, textureLoader } from '../../constants/Util'
import { addError, removeError } from '../ErrorFunctions'

export const deserializeSkybox: ComponentDeserializeFunction = (
  entity: Entity,
  data: ReturnType<typeof SkyboxComponent.toJSON>
) => {
  setComponent(entity, SkyboxComponent, data)
}

export const updateSkybox: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, SkyboxComponent)

  if (!isClient) return

  switch (component.backgroundType) {
    case SkyTypeEnum.color:
      Engine.instance.currentWorld.scene.background = component.backgroundColor
      break

    case SkyTypeEnum.cubemap:
      loadCubeMapTexture(
        component.cubemapPath,
        (texture) => {
          texture.encoding = sRGBEncoding
          Engine.instance.currentWorld.scene.background = texture
          removeError(entity, SkyboxComponent, 'FILE_ERROR')
        },
        undefined,
        (error) => addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
      )
      break

    case SkyTypeEnum.equirectangular:
      textureLoader.load(
        component.equirectangularPath,
        (texture) => {
          texture.encoding = sRGBEncoding
          Engine.instance.currentWorld.scene.background = getPmremGenerator().fromEquirectangular(texture).texture
          removeError(entity, SkyboxComponent, 'FILE_ERROR')
        },
        undefined,
        (error) => {
          addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
        }
      )
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
      Engine.instance.currentWorld.scene.background = getPmremGenerator().fromCubemap(
        component.sky.generateSkyboxTextureCube(EngineRenderer.instance.renderer)
      ).texture

      break

    default:
      break
  }

  if (component.backgroundType !== SkyTypeEnum.skybox && component.sky) {
    component.sky = null
  }
}

export const serializeSkybox: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, SkyboxComponent)
  return {
    backgroundColor: component.backgroundColor.getHex(),
    equirectangularPath: component.equirectangularPath,
    cubemapPath: component.cubemapPath,
    backgroundType: component.backgroundType,
    skyboxProps: component.skyboxProps
  }
}

const setSkyDirection = (direction: Vector3): void => {
  EngineRenderer.instance.csm?.lightDirection.copy(direction).multiplyScalar(-1)
}

export const shouldDeserializeSkybox: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(SkyboxComponent) <= 0
}
