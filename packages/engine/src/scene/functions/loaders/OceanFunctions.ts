import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Vector2, Color } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { OceanComponent, OceanComponentType } from '../../components/OceanComponent'
import { resolveMedia } from '../../../common/functions/resolveMedia'
import { isClient } from '../../../common/functions/isClient'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import { Ocean } from '../../classes/Ocean'

export const SCENE_COMPONENT_OCEAN = 'ocean'
export const SCENE_COMPONENT_OCEAN_DEFAULT_VALUES = {
  normalMap: '/ocean/water_normal.tga',
  distortionMap: '/ocean/water_distortion.tga',
  envMap: '/hdr/equirectangular/texture222.jpg',
  color: new Color(0.158628, 0.465673, 0.869792),
  opacityRange: new Vector2(0.6, 0.9),
  opacityFadeDistance: 0.12,
  shallowToDeepDistance: 0.1,
  shallowWaterColor: new Color(0.190569, 0.765519, 0.869792),
  waveScale: new Vector2(0.25, 0.25),
  waveSpeed: new Vector2(0.08, 0.0),
  waveTiling: 12.0,
  waveDistortionTiling: 7.0,
  waveDistortionSpeed: new Vector2(0.08, 0.08),
  shininess: 40,
  reflectivity: 0.25,
  bigWaveHeight: 0.7,
  bigWaveTiling: new Vector2(1.5, 1.5),
  bigWaveSpeed: new Vector2(0.02, 0.0),
  foamSpeed: new Vector2(0.05, 0.0),
  foamTiling: 2.0,
  foamColor: new Color()
}

export const deserializeOcean: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<OceanComponentType>
) => {
  if (!isClient) return

  const obj3d = new Ocean()

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, OceanComponent, {
    ...json.props,
    color: new Color(json.props.color),
    shallowWaterColor: new Color(json.props.shallowWaterColor),
    foamColor: new Color(json.props.foamColor)
  })
  addComponent(entity, UpdatableComponent, {})

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_OCEAN)

    obj3d.userData.disableOutline = true
  }

  updateOcean(entity, json.props)
}

export const updateOcean: ComponentUpdateFunction = async (entity: Entity, properties: OceanComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as Ocean
  const component = getComponent(entity, OceanComponent)

  if (properties.normalMap) {
    try {
      const { url } = await resolveMedia(component.normalMap)
      obj3d.normalMap = url
    } catch (error) {
      console.error(error)
    }
  }

  if (properties.distortionMap) {
    try {
      const { url } = await resolveMedia(component.distortionMap)
      obj3d.distortionMap = url
    } catch (error) {
      console.error(error)
    }
  }

  if (properties.envMap) {
    try {
      const { url } = await resolveMedia(component.envMap)
      obj3d.envMap = url
    } catch (error) {
      console.error(error)
    }
  }

  if (properties.hasOwnProperty('color')) obj3d.color = component.color
  if (properties.hasOwnProperty('opacityRange')) obj3d.opacityRange = component.opacityRange
  if (properties.hasOwnProperty('opacityFadeDistance')) obj3d.opacityFadeDistance = component.opacityFadeDistance
  if (properties.hasOwnProperty('shallowToDeepDistance')) obj3d.shallowToDeepDistance = component.shallowToDeepDistance
  if (properties.hasOwnProperty('shallowWaterColor')) obj3d.shallowWaterColor = component.shallowWaterColor
  if (properties.hasOwnProperty('waveScale')) obj3d.waveScale = component.waveScale
  if (properties.hasOwnProperty('waveSpeed')) obj3d.waveSpeed = component.waveSpeed
  if (properties.hasOwnProperty('waveTiling')) obj3d.waveTiling = component.waveTiling
  if (properties.hasOwnProperty('waveDistortionTiling')) obj3d.waveDistortionTiling = component.waveDistortionTiling
  if (properties.hasOwnProperty('waveDistortionSpeed')) obj3d.waveDistortionSpeed = component.waveDistortionSpeed
  if (properties.hasOwnProperty('shininess')) obj3d.shininess = component.shininess
  if (properties.hasOwnProperty('reflectivity')) obj3d.reflectivity = component.reflectivity
  if (properties.hasOwnProperty('bigWaveHeight')) obj3d.bigWaveHeight = component.bigWaveHeight
  if (properties.hasOwnProperty('bigWaveTiling')) obj3d.bigWaveTiling = component.bigWaveTiling
  if (properties.hasOwnProperty('bigWaveSpeed')) obj3d.bigWaveSpeed = component.bigWaveSpeed
  if (properties.hasOwnProperty('foamSpeed')) obj3d.foamSpeed = component.foamSpeed
  if (properties.hasOwnProperty('foamTiling')) obj3d.foamTiling = component.foamTiling
  if (properties.hasOwnProperty('foamColor')) obj3d.foamColor = component.foamColor
}

export const serializeOcean: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, OceanComponent) as OceanComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_OCEAN,
    props: {
      normalMap: component.normalMap,
      distortionMap: component.distortionMap,
      envMap: component.envMap,
      color: component.color?.getHex(),
      opacityRange: component.opacityRange,
      opacityFadeDistance: component.opacityFadeDistance,
      shallowToDeepDistance: component.shallowToDeepDistance,
      shallowWaterColor: component.shallowWaterColor?.getHex(),
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
      foamColor: component.foamColor?.getHex()
    }
  }
}
