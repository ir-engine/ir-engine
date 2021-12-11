import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/ComponentNames'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  PositionalAudioSettingsComponent,
  PositionalAudioSettingsComponentType
} from '../../components/AudioSettingsComponent'

export const SCENE_COMPONENT_AUDIO_SETTINGS = 'audio-settings'

export const deserializeAudioSetting: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  addComponent(entity, PositionalAudioSettingsComponent, json.props)
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
