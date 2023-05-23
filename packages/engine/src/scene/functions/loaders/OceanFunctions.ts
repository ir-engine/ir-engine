import { ComponentUpdateFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { OceanComponent } from '../../components/OceanComponent'
import { addError, removeError } from '../ErrorFunctions'

export const updateOcean: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, OceanComponent).ocean!
  const component = getComponent(entity, OceanComponent)

  if (obj3d.normalMap !== component.normalMap) {
    try {
      obj3d.normalMap = component.normalMap
      removeError(entity, OceanComponent, 'NORMAL_MAP_ERROR')
    } catch (error) {
      addError(entity, OceanComponent, 'NORMAL_MAP_ERROR', error.message)
      console.error(error)
    }
  }

  if (obj3d.distortionMap !== component.distortionMap) {
    try {
      obj3d.distortionMap = component.distortionMap
      removeError(entity, OceanComponent, 'DISTORTION_MAP_ERROR')
    } catch (error) {
      addError(entity, OceanComponent, 'DISTORTION_MAP_ERROR', error.message)
      console.error(error)
    }
  }

  if (obj3d.envMap !== component.envMap) {
    try {
      obj3d.envMap = component.envMap
      removeError(entity, OceanComponent, 'ENVIRONMENT_MAP_ERROR')
    } catch (error) {
      addError(entity, OceanComponent, 'ENVIRONMENT_MAP_ERROR', error.message)
      console.error(error)
    }
  }

  obj3d.color = component.color
  obj3d.opacityRange = component.opacityRange
  obj3d.opacityFadeDistance = component.opacityFadeDistance
  obj3d.shallowToDeepDistance = component.shallowToDeepDistance
  obj3d.shallowWaterColor = component.shallowWaterColor
  obj3d.waveScale = component.waveScale
  obj3d.waveSpeed = component.waveSpeed
  obj3d.waveTiling = component.waveTiling
  obj3d.waveDistortionTiling = component.waveDistortionTiling
  obj3d.waveDistortionSpeed = component.waveDistortionSpeed
  obj3d.shininess = component.shininess
  obj3d.reflectivity = component.reflectivity
  obj3d.bigWaveHeight = component.bigWaveHeight
  obj3d.bigWaveTiling = component.bigWaveTiling
  obj3d.bigWaveSpeed = component.bigWaveSpeed
  obj3d.foamSpeed = component.foamSpeed
  obj3d.foamTiling = component.foamTiling
  obj3d.foamColor = component.foamColor
}
