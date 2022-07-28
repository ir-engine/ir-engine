import { Audio, Object3D, PositionalAudio } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AssetClass } from '../../../assets/enum/AssetClass'
import { AudioComponent, AudioComponentType } from '../../../audio/components/AudioComponent'
import { AudioType, AudioTypeType } from '../../../audio/constants/AudioConstants'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { addError, removeError } from '../ErrorFunctions'
import { updateAutoStartTimeForMedia } from './MediaFunctions'

export const SCENE_COMPONENT_AUDIO = 'audio'
export const SCENE_COMPONENT_AUDIO_DEFAULT_VALUES = {
  audioSource: '',
  volume: 1,
  audioType: AudioType.Stereo as AudioTypeType,
  distanceModel: 'linear' as DistanceModelType,
  rolloffFactor: 1,
  refDistance: 20,
  maxDistance: 1000,
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 1
}

export const deserializeAudio: ComponentDeserializeFunction = async (
  entity: Entity,
  json: ComponentJson<AudioComponentType>
) => {
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) obj3d = addComponent(entity, Object3DComponent, { value: new Object3D() }).value

  if (!isClient) return

  const props = parseAudioProperties(json.props)
  addComponent(entity, AudioComponent, props)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_AUDIO)
}

export const updateAudio = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const audioComponent = getComponent(entity, AudioComponent)
  console.log('updateAudio', entity, audioComponent)
  let audioTypeChanged = false

  if (audioComponent.audioType === AudioType.Stereo && !(obj3d.userData.audioEl instanceof Audio)) {
    if (obj3d.userData.audioEl) obj3d.userData.audioEl.removeFromParent()

    obj3d.userData.audioEl = new Audio(Engine.instance.currentWorld.audioListener)
    obj3d.userData.audioEl.matrixAutoUpdate = false
    obj3d.add(obj3d.userData.audioEl)

    updateAutoStartTimeForMedia(entity)
    audioTypeChanged = true
  }

  if (audioComponent.audioType === AudioType.Positional && !(obj3d.userData.audioEl instanceof PositionalAudio)) {
    if (obj3d.userData.audioEl) obj3d.userData.audioEl.removeFromParent()

    obj3d.userData.audioEl = new PositionalAudio(Engine.instance.currentWorld.audioListener)
    obj3d.add(obj3d.userData.audioEl)

    updateAutoStartTimeForMedia(entity)
    audioTypeChanged = true
  }

  if (obj3d.userData.audioEl.src !== audioComponent.audioSource) {
    try {
      const assetType = AssetLoader.getAssetClass(audioComponent.audioSource)
      if (assetType !== AssetClass.Audio) {
        addError(entity, 'error', `Audio format ${audioComponent.audioSource.split('.').pop()}not supported`)
        return
      }
      const audioBuffer = AssetLoader.getFromCache(audioComponent.audioSource)
      if (!audioBuffer) return addError(entity, 'error', 'Failed to load audio buffer')

      if (obj3d.userData.audioEl.isPlaying) obj3d.userData.audioEl.stop()

      obj3d.userData.audioEl.setBuffer(audioBuffer)
      if (!audioTypeChanged) updateAutoStartTimeForMedia(entity)
      removeError(entity, 'error')
    } catch (error) {
      addError(entity, 'error', error.message)
      console.error(error)
    }
  }

  if (typeof audioComponent.volume !== 'undefined') {
    obj3d.userData.audioEl.setVolume(audioComponent.volume)
  }

  if (audioComponent.audioType === AudioType.Positional) {
    const audioEl = obj3d.userData.audioEl as PositionalAudio
    if (audioTypeChanged || audioComponent.distanceModel !== audioEl.getDistanceModel())
      audioEl.setDistanceModel(audioComponent.distanceModel)
    if (audioTypeChanged || audioComponent.rolloffFactor !== audioEl.getRolloffFactor())
      audioEl.setRolloffFactor(audioComponent.rolloffFactor)
    if (audioTypeChanged || audioComponent.refDistance !== audioEl.getRefDistance())
      audioEl.setRefDistance(audioComponent.refDistance)
    if (audioTypeChanged || audioComponent.maxDistance !== audioEl.getMaxDistance())
      audioEl.setMaxDistance(audioComponent.maxDistance)
    if (audioTypeChanged || audioComponent.coneInnerAngle !== audioEl.panner.coneInnerAngle)
      audioEl.panner.coneInnerAngle = audioComponent.coneInnerAngle
    if (audioTypeChanged || audioComponent.coneOuterAngle !== audioEl.panner.coneOuterAngle)
      audioEl.panner.coneOuterAngle = audioComponent.coneOuterAngle
    if (audioTypeChanged || audioComponent.coneOuterGain !== audioEl.panner.coneOuterAngle)
      audioEl.panner.coneOuterGain = audioComponent.coneOuterGain
  }

  const mediaComponent = getComponent(entity, MediaComponent)
  if (mediaComponent) {
    obj3d.userData.audioEl.autoplay = mediaComponent.autoplay
    obj3d.userData.audioEl.setLoop(mediaComponent.loop)
  }
}

export const serializeAudio: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, AudioComponent) as AudioComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_AUDIO,
    props: {
      audioSource: component.audioSource,
      volume: component.volume,
      audioType: component.audioType,
      distanceModel: component.distanceModel,
      rolloffFactor: component.rolloffFactor,
      refDistance: component.refDistance,
      maxDistance: component.maxDistance,
      coneInnerAngle: component.coneInnerAngle,
      coneOuterAngle: component.coneOuterAngle,
      coneOuterGain: component.coneOuterGain
    }
  }
}

export const prepareAudioForGLTFExport: ComponentPrepareForGLTFExportFunction = (audio) => {
  if (audio.userData.audioEl) {
    if (audio.userData.audioEl.parent) audio.userData.audioEl.removeFromParent()
    delete audio.userData.audioEl
  }

  if (audio.userData.textureMesh) {
    if (audio.userData.textureMesh.parent) audio.userData.textureMesh.removeFromParent()
    delete audio.userData.textureMesh
  }
}

export const toggleAudio = (entity: Entity) => {
  const audioEl = getComponent(entity, Object3DComponent)?.value.userData.audioEl as Audio
  if (!audioEl) return

  if (audioEl.isPlaying) audioEl.stop()
  else audioEl.play()
}

export const parseAudioProperties = (props): AudioComponentType => {
  return {
    audioSource: props.audioSource ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.audioSource,
    volume: props.volume ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.volume,
    audioType: props.audioType ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.audioType,
    distanceModel: props.distanceModel ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.distanceModel,
    rolloffFactor: props.rolloffFactor ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.rolloffFactor,
    refDistance: props.refDistance ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.refDistance,
    maxDistance: props.maxDistance ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.maxDistance,
    coneInnerAngle: props.coneInnerAngle ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.coneInnerAngle,
    coneOuterAngle: props.coneOuterAngle ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.coneOuterAngle,
    coneOuterGain: props.coneOuterGain ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.coneOuterGain
  }
}
