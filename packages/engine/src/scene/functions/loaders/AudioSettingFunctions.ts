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
  usePositionalAudio: true,
  avatarDistanceModel: 'inverse',
  avatarRolloffFactor: 2,
  avatarRefDistance: 1,
  avatarMaxDistance: 10000,
  mediaVolume: 1,
  mediaDistanceModel: 'inverse',
  mediaRolloffFactor: 1,
  mediaRefDistance: 20,
  mediaMaxDistance: 10000,
  mediaConeInnerAngle: 360,
  mediaConeOuterAngle: 0,
  mediaConeOuterGain: 0
}

export const deserializeAudioSetting: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<PositionalAudioSettingsComponentType>
) => {
  const props = parseAudioSettingProperties(json.props)

  addComponent(entity, PositionalAudioSettingsComponent, props)
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_AUDIO_SETTINGS)
}

export const serializeAudioSetting: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, PositionalAudioSettingsComponent) as PositionalAudioSettingsComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_AUDIO_SETTINGS,
    props: {
      usePositionalAudio: component.usePositionalAudio,
      avatarDistanceModel: component.avatarDistanceModel,
      avatarRolloffFactor: component.avatarRolloffFactor,
      avatarRefDistance: component.avatarRefDistance,
      avatarMaxDistance: component.avatarMaxDistance,
      mediaVolume: component.mediaVolume,
      mediaDistanceModel: component.mediaDistanceModel,
      mediaRolloffFactor: component.mediaRolloffFactor,
      mediaRefDistance: component.mediaRefDistance,
      mediaMaxDistance: component.mediaMaxDistance,
      mediaConeInnerAngle: component.mediaConeInnerAngle,
      mediaConeOuterAngle: component.mediaConeOuterAngle,
      mediaConeOuterGain: component.mediaConeOuterGain
    }
  }
}

const parseAudioSettingProperties = (props): PositionalAudioSettingsComponentType => {
  return {
    usePositionalAudio: props.usePositionalAudio ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.usePositionalAudio,
    avatarDistanceModel: props.avatarDistanceModel ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarDistanceModel,
    avatarRolloffFactor: props.avatarRolloffFactor ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarRolloffFactor,
    avatarRefDistance: props.avatarRefDistance ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarRefDistance,
    avatarMaxDistance: props.avatarMaxDistance ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarMaxDistance,
    mediaVolume: props.mediaVolume ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaVolume,
    mediaDistanceModel: props.mediaDistanceModel ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaDistanceModel,
    mediaRolloffFactor: props.mediaRolloffFactor ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaRolloffFactor,
    mediaRefDistance: props.mediaRefDistance ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaRefDistance,
    mediaMaxDistance: props.mediaMaxDistance ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaMaxDistance,
    mediaConeInnerAngle: props.mediaConeInnerAngle ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaConeInnerAngle,
    mediaConeOuterAngle: props.mediaConeOuterAngle ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaConeOuterAngle,
    mediaConeOuterGain: props.mediaConeOuterGain ?? SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaConeOuterGain
  }
}
