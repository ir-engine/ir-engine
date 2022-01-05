import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  Mesh,
  PlaneBufferGeometry,
  Object3D,
  Audio,
  PositionalAudio,
  Texture,
  MeshBasicMaterial,
  DoubleSide
} from 'three'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { resolveMedia } from '../../../common/functions/resolveMedia'
import { AudioType } from '../../../audio/constants/AudioConstants'
import { AudioComponent, AudioComponentType } from '../../../audio/components/AudioComponent'
import { loadAudio } from '../../../assets/functions/loadAudio'
import loadTexture from '../../../assets/functions/loadTexture'
import { isClient } from '../../../common/functions/isClient'
import { updateAutoStartTimeForMedia } from './MediaFunctions'

export const SCENE_COMPONENT_AUDIO = 'audio'
export const SCENE_COMPONENT_AUDIO_DEFAULT_VALUES = {
  audioSource: '',
  volume: 0.5,
  audioType: AudioType.Positional,
  distanceModel: 'linear',
  rolloffFactor: 1,
  refDistance: 20,
  maxDistance: 1000,
  coneInnerAngle: 120,
  coneOuterAngle: 180,
  coneOuterGain: 0
}

let audioTexture: Texture = null!
const AUDIO_TEXTURE_PATH = '/static/editor/audio-icon.png' // Static

export const deserializeAudio: ComponentDeserializeFunction = async (entity: Entity, json: ComponentJson) => {
  let obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) obj3d = addComponent(entity, Object3DComponent, { value: new Object3D() }).value

  if (!isClient) return

  addComponent(entity, AudioComponent, { ...json.props })

  if (Engine.isEditor) {
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_AUDIO)

    obj3d.userData.textureMesh = new Mesh(
      new PlaneBufferGeometry(),
      new MeshBasicMaterial({ transparent: true, side: DoubleSide })
    )

    obj3d.add(obj3d.userData.textureMesh)

    if (!audioTexture) {
      // can't use await since component should have to be deserialize for media component to work properly
      loadTexture(AUDIO_TEXTURE_PATH).then((texture) => {
        audioTexture = texture!
        obj3d.userData.textureMesh.material.map = audioTexture
      })
    } else {
      obj3d.userData.textureMesh.material.map = audioTexture
    }
  }

  updateAudio(entity, json.props)
}

export const updateAudio: ComponentUpdateFunction = async (entity: Entity, properties: AudioComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const component = getComponent(entity, AudioComponent)
  let audioTypeChanged = false

  if (properties.hasOwnProperty('audioType')) {
    if (obj3d.userData.audioEl) obj3d.userData.audioEl.removeFromParent()
    obj3d.userData.audioEl =
      component.audioType === AudioType.Stereo
        ? new Audio(Engine.audioListener)
        : new PositionalAudio(Engine.audioListener)

    obj3d.add(obj3d.userData.audioEl)
    updateAutoStartTimeForMedia(entity)
    audioTypeChanged = true
  }

  if (properties.audioSource) {
    try {
      const { url } = await resolveMedia(component.audioSource)
      const audioBuffer = await loadAudio(url)
      if (!audioBuffer) return

      if (obj3d.userData.audioEl.isPlaying) obj3d.userData.audioEl.stop()

      obj3d.userData.audioEl.setBuffer(audioBuffer)
      if (!audioTypeChanged) updateAutoStartTimeForMedia(entity)
    } catch (error) {
      console.error(error)
    }
  }

  if (properties.hasOwnProperty('volume')) {
    obj3d.userData.audioEl.setVolume(component.volume)
  }

  if (component.audioType === AudioType.Positional) {
    const audioEl = obj3d.userData.audioEl as PositionalAudio
    if (audioTypeChanged || properties.hasOwnProperty('distanceModel'))
      audioEl.setDistanceModel(component.distanceModel)
    if (audioTypeChanged || properties.hasOwnProperty('rolloffFactor'))
      audioEl.setRolloffFactor(component.rolloffFactor)
    if (audioTypeChanged || properties.hasOwnProperty('refDistance')) audioEl.setRefDistance(component.refDistance)
    if (audioTypeChanged || properties.hasOwnProperty('maxDistance')) audioEl.setMaxDistance(component.maxDistance)
    if (audioTypeChanged || properties.hasOwnProperty('coneInnerAngle'))
      audioEl.panner.coneInnerAngle = component.coneInnerAngle
    if (audioTypeChanged || properties.hasOwnProperty('coneOuterAngle'))
      audioEl.panner.coneOuterAngle = component.coneOuterAngle
    if (audioTypeChanged || properties.hasOwnProperty('coneOuterGain'))
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
