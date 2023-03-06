import { CubeTexture, sRGBEncoding } from 'three'
import { Vector3 } from 'three'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, getComponentCountOfType, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { Sky } from '../../classes/Sky'
import { SkyboxComponent } from '../../components/SkyboxComponent'
import { SkyTypeEnum } from '../../constants/SkyTypeEnum'
import { getPmremGenerator, loadCubeMapTexture } from '../../constants/Util'
import { addError, removeError } from '../ErrorFunctions'

export const updateSkybox: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, SkyboxComponent)

  if (!isClient) return

  switch (component.backgroundType) {
    case SkyTypeEnum.color:
      Engine.instance.scene.background = component.backgroundColor
      break
    case SkyTypeEnum.cubemap:
      const onLoad = (texture: CubeTexture) => {
        texture.encoding = sRGBEncoding
        Engine.instance.scene.background = getPmremGenerator().fromCubemap(texture).texture
        removeError(entity, SkyboxComponent, 'FILE_ERROR')
      }
      const loadArgs: [
        string,
        (texture: CubeTexture) => void,
        ((event: ProgressEvent<EventTarget>) => void) | undefined,
        ((event: ErrorEvent) => void) | undefined
      ] = [
        component.cubemapPath,
        onLoad,
        undefined,
        (error) => addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
      ]
      loadCubeMapTexture(...loadArgs)
      break

    case SkyTypeEnum.equirectangular:
      AssetLoader.load(
        component.equirectangularPath,
        {},
        (texture) => {
          texture.encoding = sRGBEncoding
          Engine.instance.scene.background = getPmremGenerator().fromEquirectangular(texture).texture
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

      EngineRenderer.instance.csm?.lightDirection.copy(component.sky.sunPosition).multiplyScalar(-1)
      Engine.instance.scene.background = getPmremGenerator().fromCubemap(
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
