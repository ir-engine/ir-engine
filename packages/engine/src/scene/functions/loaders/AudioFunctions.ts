import {
  Audio,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  PositionalAudio,
  Texture
} from 'three'

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
import { ObjectLayers } from '../../constants/ObjectLayers'
import { addError, removeError } from '../ErrorFunctions'
import { setObjectLayers } from '../setObjectLayers'
import { updateAutoStartTimeForMedia } from './MediaFunctions'

export const SCENE_COMPONENT_AUDIO = 'audio'
export const SCENE_COMPONENT_AUDIO_DEFAULT_VALUES = {
  audioSource: '',
  volume: 1,
  audioType: AudioType.Positional as AudioTypeType,
  distanceModel: 'linear' as DistanceModelType,
  rolloffFactor: 1,
  refDistance: 20,
  maxDistance: 1000,
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 1
}

let audioTexture: Texture = null!
const AUDIO_TEXTURE_PATH = '/static/editor/audio-icon.png' // Static

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

  obj3d.userData.textureMesh = new Mesh(
    new PlaneBufferGeometry(),
    new MeshBasicMaterial({ transparent: true, side: DoubleSide })
  )
  obj3d.add(obj3d.userData.textureMesh)
  obj3d.userData.textureMesh.userData.disableOutline = true
  obj3d.userData.textureMesh.userData.isHelper = true
  setObjectLayers(obj3d.userData.textureMesh, ObjectLayers.NodeHelper)

  if (audioTexture) {
    obj3d.userData.textureMesh.material.map = audioTexture
  } else {
    // can't use await since component should have to be deserialize for media component to work properly
    AssetLoader.loadAsync(AUDIO_TEXTURE_PATH).then((texture) => {
      audioTexture = texture!
      obj3d.userData.textureMesh.material.map = audioTexture
    })
  }

  updateAudio(entity, props)

  const mediaComponent = getComponent(entity, MediaComponent)
  if (mediaComponent) {
    obj3d.userData.audioEl.autoplay = mediaComponent.autoplay
    obj3d.userData.audioEl.setLoop(mediaComponent.loop)
    updateAutoStartTimeForMedia(entity)
  }
}

export const updateAudio: ComponentUpdateFunction = (entity: Entity, properties: AudioComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const component = getComponent(entity, AudioComponent)
  let audioTypeChanged = false

  if (typeof properties.audioType !== 'undefined') {
    if (obj3d.userData.audioEl) obj3d.userData.audioEl.removeFromParent()
    obj3d.userData.audioEl =
      component.audioType === AudioType.Stereo
        ? new Audio(Engine.instance.currentWorld.audioListener)
        : new PositionalAudio(Engine.instance.currentWorld.audioListener)

    obj3d.userData.audioEl.matrixAutoUpdate = false
    obj3d.add(obj3d.userData.audioEl)
    updateAutoStartTimeForMedia(entity)
    audioTypeChanged = true
  }

  if (properties.audioSource) {
    try {
      const assetType = AssetLoader.getAssetClass(component.audioSource)
      if (assetType !== AssetClass.Audio) {
        addError(entity, 'error', `Audio format ${component.audioSource.split('.').pop()}not supported`)
        return
      }
      const audioBuffer = AssetLoader.getFromCache(component.audioSource)
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

  if (typeof properties.volume !== 'undefined') {
    obj3d.userData.audioEl.setVolume(component.volume)
  }

  if (component.audioType === AudioType.Positional) {
    const audioEl = obj3d.userData.audioEl as PositionalAudio
    if (audioTypeChanged || typeof properties.distanceModel !== 'undefined')
      audioEl.setDistanceModel(component.distanceModel)
    if (audioTypeChanged || typeof properties.rolloffFactor !== 'undefined')
      audioEl.setRolloffFactor(component.rolloffFactor)
    if (audioTypeChanged || typeof properties.refDistance !== 'undefined') audioEl.setRefDistance(component.refDistance)
    if (audioTypeChanged || typeof properties.maxDistance !== 'undefined') audioEl.setMaxDistance(component.maxDistance)
    if (audioTypeChanged || typeof properties.coneInnerAngle !== 'undefined')
      audioEl.panner.coneInnerAngle = component.coneInnerAngle
    if (audioTypeChanged || typeof properties.coneOuterAngle !== 'undefined')
      audioEl.panner.coneOuterAngle = component.coneOuterAngle
    if (audioTypeChanged || typeof properties.coneOuterGain !== 'undefined')
      audioEl.panner.coneOuterGain = component.coneOuterGain
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
