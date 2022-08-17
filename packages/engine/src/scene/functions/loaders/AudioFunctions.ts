import { DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { getState } from '@xrengine/hyperflux'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AudioState } from '../../../audio/AudioState'
import { AudioComponent, AudioComponentType } from '../../../audio/components/AudioComponent'
import { AudioType, AudioTypeType } from '../../../audio/constants/AudioConstants'
import { AudioElementNode, AudioElementNodes } from '../../../audio/systems/AudioSystem'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { CallbackComponent } from '../../components/CallbackComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { MediaElementComponent } from '../../components/MediaElementComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { PlayMode } from '../../constants/PlayMode'
import { setObjectLayers } from '../setObjectLayers'
import { getNextPlaylistItem, updateAutoStartTimeForMedia } from './MediaFunctions'

export const AUDIO_TEXTURE_PATH = '/static/editor/audio-icon.png' // Static

export const SCENE_COMPONENT_AUDIO = 'audio'
export const SCENE_COMPONENT_AUDIO_DEFAULT_VALUES = {
  volume: 1,
  audioType: AudioType.Stereo as AudioTypeType,
  isMusic: false,
  distanceModel: 'linear' as DistanceModelType,
  rolloffFactor: 1,
  refDistance: 20,
  maxDistance: 1000,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0
} as AudioComponentType

export const AudioElementObjects = new WeakMap<Object3D, Mesh>()

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

export const createAudioNode = (
  el: HTMLMediaElement | MediaStream,
  source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode,
  mixbusNode: GainNode
): AudioElementNode => {
  const gain = Engine.instance.audioContext.createGain()
  gain.connect(mixbusNode)
  source.connect(gain)
  const audioObject = { source, gain }
  AudioElementNodes.set(el, audioObject)
  return audioObject
}

export const updateAudioPrefab = (entity: Entity) => {
  const audioComponent = getComponent(entity, AudioComponent)
  const mediaComponent = getComponent(entity, MediaComponent)
  const obj3d = getComponent(entity, Object3DComponent).value

  const currentPath = mediaComponent.paths.length ? mediaComponent.paths[mediaComponent.currentSource] : ''

  if (!AudioElementObjects.has(obj3d)) {
    const textureMesh = new Mesh(
      new PlaneBufferGeometry(),
      new MeshBasicMaterial({ transparent: true, side: DoubleSide })
    )
    obj3d.add(textureMesh)
    textureMesh.userData.disableOutline = true
    textureMesh.userData.isHelper = true
    setObjectLayers(textureMesh, ObjectLayers.NodeHelper)
    AudioElementObjects.set(obj3d, textureMesh)
    AssetLoader.loadAsync(AUDIO_TEXTURE_PATH).then((texture) => {
      textureMesh.material.map = texture
    })
  }

  if (!hasComponent(entity, MediaElementComponent)) {
    const el = document.createElement('audio')
    el.setAttribute('crossOrigin', 'anonymous')
    if (
      mediaComponent.playMode === PlayMode.SingleLoop ||
      (mediaComponent.playMode === PlayMode.Loop && mediaComponent.paths.length === 1)
    )
      el.setAttribute('loop', 'true')
    el.setAttribute('preload', 'metadata')

    // Setting autoplay to false will not work
    // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-autoplay
    if (mediaComponent.autoplay) el.setAttribute('autoplay', 'true')

    el.setAttribute('playsInline', 'true')
    el.setAttribute('playsinline', 'true')
    el.setAttribute('webkit-playsInline', 'true')
    el.setAttribute('webkit-playsinline', 'true')
    el.setAttribute('muted', 'true')
    el.hidden = true
    document.body.appendChild(el)

    el.addEventListener('playing', () => {
      mediaComponent.playing = true
    })
    el.addEventListener('pause', () => {
      mediaComponent.playing = false
    })
    el.addEventListener('ended', () => {
      if (mediaComponent.stopOnNextTrack) return
      const nextItem = getNextPlaylistItem(entity)
      mediaComponent.currentSource = nextItem
      el.src = mediaComponent.paths[mediaComponent.currentSource]
      el.play()
    })

    addComponent(entity, CallbackComponent, {
      play: () => el.play(),
      pause: () => el.pause()
      /** todo, add next/previous */
    })

    addComponent(entity, MediaElementComponent, el)

    const audioState = getState(AudioState)
    // todo: music / sfx option
    const { gain } = createAudioNode(
      el,
      Engine.instance.audioContext.createMediaElementSource(el),
      audioComponent.isMusic ? Engine.instance.gainNodeMixBuses.music : Engine.instance.gainNodeMixBuses.soundEffects
    )
    gain.gain.setTargetAtTime(audioState.mediaStreamVolume.value, Engine.instance.audioContext.currentTime, 0.01)
  }

  const el = getComponent(entity, MediaElementComponent)
  if (currentPath !== el.src) {
    const onloadeddata = () => {
      el.removeEventListener('loadeddata', onloadeddata)
      el.muted = false
      if (el.autoplay) {
        if (getEngineState().userHasInteracted.value) {
          el.play()
        }

        if (!Engine.instance.isEditor) updateAutoStartTimeForMedia(entity)
      }
    }
    el.addEventListener('loadeddata', onloadeddata, { once: true })
    el.src = currentPath
  }
}

export const updateAudioParameters = (entity: Entity) => {
  const audioComponent = getComponent(entity, AudioComponent)
  const el = getComponent(entity, MediaElementComponent)
  el.volume = audioComponent.volume

  const audioNode = AudioElementNodes.get(el)

  if (audioNode) {
    if (audioNode.panner) {
      audioNode.panner.distanceModel = audioComponent.distanceModel
      audioNode.panner.rolloffFactor = audioComponent.rolloffFactor
      audioNode.panner.refDistance = audioComponent.refDistance
      audioNode.panner.maxDistance = audioComponent.maxDistance
      audioNode.panner.coneInnerAngle = audioComponent.coneInnerAngle
      audioNode.panner.coneOuterAngle = audioComponent.coneOuterAngle
      audioNode.panner.coneOuterGain = audioComponent.coneOuterGain
    }
  }
}

export const serializeAudio: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, AudioComponent) as AudioComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_AUDIO,
    props: {
      volume: component.volume,
      audioType: component.audioType,
      isMusic: component.isMusic,
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

export const prepareAudioForGLTFExport: ComponentPrepareForGLTFExportFunction = (obj3d) => {
  AudioElementObjects.get(obj3d)!.removeFromParent()
}

export const parseAudioProperties = (props): AudioComponentType => {
  return {
    volume: props.volume ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.volume,
    audioType: props.audioType ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.audioType,
    isMusic: props.isMusic ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.isMusic,
    distanceModel: props.distanceModel ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.distanceModel,
    rolloffFactor: props.rolloffFactor ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.rolloffFactor,
    refDistance: props.refDistance ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.refDistance,
    maxDistance: props.maxDistance ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.maxDistance,
    coneInnerAngle: props.coneInnerAngle ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.coneInnerAngle,
    coneOuterAngle: props.coneOuterAngle ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.coneOuterAngle,
    coneOuterGain: props.coneOuterGain ?? SCENE_COMPONENT_AUDIO_DEFAULT_VALUES.coneOuterGain
  }
}
