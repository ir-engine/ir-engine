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

export const deserializeAudioSetting: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson) => {
  addComponent(entity, PositionalAudioSettingsComponent, json.props)
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
