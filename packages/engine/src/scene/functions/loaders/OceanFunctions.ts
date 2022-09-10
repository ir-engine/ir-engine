import { Color, Vector2 } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { Ocean } from '../../classes/Ocean'
import { setCallback } from '../../components/CallbackComponent'
import { addObjectToGroup } from '../../components/GroupComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  OceanComponent,
  OceanComponentType,
  SCENE_COMPONENT_OCEAN_DEFAULT_VALUES
} from '../../components/OceanComponent'
import { UpdatableCallback } from '../../components/UpdatableComponent'
import { addError, removeError } from '../ErrorFunctions'

export const deserializeOcean: ComponentDeserializeFunction = (entity: Entity, data: OceanComponentType) => {
  const props = parseOceanProperties(data)
  setComponent(entity, OceanComponent, props)
  const ocean = new Ocean(entity)
  addObjectToGroup(entity, ocean)
  setCallback(entity, UpdatableCallback, (dt: number) => {
    ocean.update(dt)
  })
}

export const updateOcean: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, OceanComponent).ocean!
  const component = getComponent(entity, OceanComponent)

  if (obj3d.normalMap !== component.normalMap) {
    try {
      obj3d.normalMap = component.normalMap
      removeError(entity, 'normalMapError')
    } catch (error) {
      addError(entity, 'normalMapError', error.message)
      console.error(error)
    }
  }

  if (obj3d.distortionMap !== component.distortionMap) {
    try {
      obj3d.distortionMap = component.distortionMap
      removeError(entity, 'distortionMapError')
    } catch (error) {
      addError(entity, 'distortionMapError', error.message)
      console.error(error)
    }
  }

  if (obj3d.envMap !== component.envMap) {
    try {
      obj3d.envMap = component.envMap
      removeError(entity, 'envMapError')
    } catch (error) {
      addError(entity, 'envMapError', error.message)
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

export const serializeOcean: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, OceanComponent) as OceanComponentType
  return {
    normalMap: component.normalMap,
    distortionMap: component.distortionMap,
    envMap: component.envMap,
    color: component.color.getHex(),
    opacityRange: component.opacityRange,
    opacityFadeDistance: component.opacityFadeDistance,
    shallowToDeepDistance: component.shallowToDeepDistance,
    shallowWaterColor: component.shallowWaterColor.getHex(),
    waveScale: component.waveScale,
    waveSpeed: component.waveSpeed,
    waveTiling: component.waveTiling,
    waveDistortionTiling: component.waveDistortionTiling,
    waveDistortionSpeed: component.waveDistortionSpeed,
    shininess: component.shininess,
    reflectivity: component.reflectivity,
    bigWaveHeight: component.bigWaveHeight,
    bigWaveTiling: component.bigWaveTiling,
    bigWaveSpeed: component.bigWaveSpeed,
    foamSpeed: component.foamSpeed,
    foamTiling: component.foamTiling,
    foamColor: component.foamColor.getHex()
  }
}

const parseOceanProperties = (props): OceanComponentType => {
  const result = {
    normalMap: props.normalMap ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.normalMap,
    distortionMap: props.distortionMap ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.distortionMap,
    envMap: props.envMap ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.envMap,
    color: new Color(props.color ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.color),
    opacityFadeDistance: props.opacityFadeDistance ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.opacityFadeDistance,
    shallowToDeepDistance: props.shallowToDeepDistance ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.shallowToDeepDistance,
    shallowWaterColor: new Color(props.shallowWaterColor ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.shallowWaterColor),
    waveTiling: props.waveTiling ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveTiling,
    waveDistortionTiling: props.waveDistortionTiling ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveDistortionTiling,
    shininess: props.shininess ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.shininess,
    reflectivity: props.reflectivity ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.reflectivity,
    bigWaveHeight: props.bigWaveHeight ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.bigWaveHeight,
    foamTiling: props.foamTiling ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.foamTiling,
    foamColor: new Color(props.foamColor ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.foamColor)
  } as OceanComponentType

  let tempV2 = props.opacityRange ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.opacityRange
  result.opacityRange = new Vector2(tempV2.x, tempV2.y)

  tempV2 = props.waveScale ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveScale
  result.waveScale = new Vector2(tempV2.x, tempV2.y)

  tempV2 = props.waveSpeed ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveSpeed
  result.waveSpeed = new Vector2(tempV2.x, tempV2.y)

  tempV2 = props.waveDistortionSpeed ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.waveDistortionSpeed
  result.waveDistortionSpeed = new Vector2(tempV2.x, tempV2.y)

  tempV2 = props.bigWaveTiling ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.bigWaveTiling
  result.bigWaveTiling = new Vector2(tempV2.x, tempV2.y)

  tempV2 = props.bigWaveSpeed ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.bigWaveSpeed
  result.bigWaveSpeed = new Vector2(tempV2.x, tempV2.y)

  tempV2 = props.foamSpeed ?? SCENE_COMPONENT_OCEAN_DEFAULT_VALUES.foamSpeed
  result.foamSpeed = new Vector2(tempV2.x, tempV2.y)

  return result
}
