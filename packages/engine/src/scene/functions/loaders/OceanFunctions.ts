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
  color: 0x2876dd,
  opacityRange: { x: 0.6, y: 0.9 },
  opacityFadeDistance: 0.12,
  shallowToDeepDistance: 0.1,
  shallowWaterColor: 0x30c3dd,
  waveScale: { x: 0.25, y: 0.25 },
  waveSpeed: { x: 0.08, y: 0.0 },
  waveTiling: 12.0,
  waveDistortionTiling: 7.0,
  waveDistortionSpeed: { x: 0.08, y: 0.08 },
  shininess: 40,
  reflectivity: 0.25,
  bigWaveHeight: 0.7,
  bigWaveTiling: { x: 1.5, y: 1.5 },
  bigWaveSpeed: { x: 0.02, y: 0.0 },
  foamSpeed: { x: 0.05, y: 0.0 },
  foamTiling: 2.0,
  foamColor: 0xffffff
}

export const deserializeOcean: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<OceanComponentType>
) => {
  if (!isClient) return

  const obj3d = new Ocean()
  const props = parseOceanProperties(json.props)

  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, OceanComponent, props)
  addComponent(entity, UpdatableComponent, {})

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_OCEAN)

    obj3d.userData.disableOutline = true
  }

  updateOcean(entity, props)
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

  if (typeof properties.color !== 'undefined') obj3d.color = component.color
  if (typeof properties.opacityRange !== 'undefined') obj3d.opacityRange = component.opacityRange
  if (typeof properties.opacityFadeDistance !== 'undefined') obj3d.opacityFadeDistance = component.opacityFadeDistance
  if (typeof properties.shallowToDeepDistance !== 'undefined')
    obj3d.shallowToDeepDistance = component.shallowToDeepDistance
  if (typeof properties.shallowWaterColor !== 'undefined') obj3d.shallowWaterColor = component.shallowWaterColor
  if (typeof properties.waveScale !== 'undefined') obj3d.waveScale = component.waveScale
  if (typeof properties.waveSpeed !== 'undefined') obj3d.waveSpeed = component.waveSpeed
  if (typeof properties.waveTiling !== 'undefined') obj3d.waveTiling = component.waveTiling
  if (typeof properties.waveDistortionTiling !== 'undefined')
    obj3d.waveDistortionTiling = component.waveDistortionTiling
  if (typeof properties.waveDistortionSpeed !== 'undefined') obj3d.waveDistortionSpeed = component.waveDistortionSpeed
  if (typeof properties.shininess !== 'undefined') obj3d.shininess = component.shininess
  if (typeof properties.reflectivity !== 'undefined') obj3d.reflectivity = component.reflectivity
  if (typeof properties.bigWaveHeight !== 'undefined') obj3d.bigWaveHeight = component.bigWaveHeight
  if (typeof properties.bigWaveTiling !== 'undefined') obj3d.bigWaveTiling = component.bigWaveTiling
  if (typeof properties.bigWaveSpeed !== 'undefined') obj3d.bigWaveSpeed = component.bigWaveSpeed
  if (typeof properties.foamSpeed !== 'undefined') obj3d.foamSpeed = component.foamSpeed
  if (typeof properties.foamTiling !== 'undefined') obj3d.foamTiling = component.foamTiling
  if (typeof properties.foamColor !== 'undefined') obj3d.foamColor = component.foamColor
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
