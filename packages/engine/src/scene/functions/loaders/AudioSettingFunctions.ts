import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  PositionalAudioSettingsComponent,
  PositionalAudioSettingsComponentType
} from '../../components/AudioSettingsComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_AUDIO_SETTINGS = 'audio-settings'
export const SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES = {
  refDistance: 20,
  rolloffFactor: 1,
  maxDistance: 10000,
  distanceModel: 'linear' as DistanceModelType,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0
}

export const deserializeAudioSetting: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<PositionalAudioSettingsComponentType>
) => {
  const props = parseAudioSettingProperties(json.props)

  addComponent(entity, PositionalAudioSettingsComponent, props)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_AUDIO_SETTINGS)

  Engine.instance.spatialAudioSettings = { ...props }
}

export const serializeAudioSetting: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, PositionalAudioSettingsComponent) as PositionalAudioSettingsComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_AUDIO_SETTINGS,
    props: {
      refDistance: component.refDistance,
      rolloffFactor: component.rolloffFactor,
      maxDistance: component.maxDistance,
      distanceModel: component.distanceModel,
      coneInnerAngle: component.coneInnerAngle,
      coneOuterAngle: component.coneOuterAngle,
      coneOuterGain: component.coneOuterGain
    }
  }
}

export const parseAudioSettingProperties = (props): PositionalAudioSettingsComponentType => {
  return {
    refDistance: props.refDistance ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.refDistance,
    rolloffFactor: props.rolloffFactor ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.rolloffFactor,
    maxDistance: props.maxDistance ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.maxDistance,
    distanceModel: props.distanceModel ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.distanceModel,
    coneInnerAngle: props.coneInnerAngle ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.coneInnerAngle,
    coneOuterAngle: props.coneOuterAngle ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.coneOuterAngle,
    coneOuterGain: props.coneOuterGain ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.coneOuterGain
  }
}
