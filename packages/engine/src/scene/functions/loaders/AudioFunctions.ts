import { Audio, DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AudioComponent, AudioComponentType } from '../../../audio/components/AudioComponent'
import { PositionalAudioTagComponent } from '../../../audio/components/PositionalAudioTagComponent'
import { AudioType, AudioTypeType } from '../../../audio/constants/AudioConstants'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { PlayMode } from '../../constants/PlayMode'
import { removeError } from '../ErrorFunctions'
import { setObjectLayers } from '../setObjectLayers'
import { getNextPlaylistItem, updateAutoStartTimeForMedia } from './MediaFunctions'

export const AUDIO_TEXTURE_PATH = '/static/editor/audio-icon.png' // Static

export const SCENE_COMPONENT_AUDIO = 'audio'
export const SCENE_COMPONENT_AUDIO_DEFAULT_VALUES = {
  volume: 1,
  audioType: AudioType.Stereo as AudioTypeType,
  distanceModel: 'linear' as DistanceModelType,
  rolloffFactor: 1,
  refDistance: 20,
  maxDistance: 1000,
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 1
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

export const updateAudio = (entity: Entity) => {
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
    textureMesh.material.map = AssetLoader.getFromCache(AUDIO_TEXTURE_PATH)
    setObjectLayers(textureMesh, ObjectLayers.NodeHelper)
    AudioElementObjects.set(obj3d, textureMesh)
  }

  if (!mediaComponent.el) {
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
    mediaComponent.el = el
  }

  const el = getComponent(entity, MediaComponent).el!

  if (audioComponent.audioType === AudioType.Stereo && hasComponent(entity, PositionalAudioTagComponent))
    removeComponent(entity, PositionalAudioTagComponent)

  if (audioComponent.audioType === AudioType.Positional && !hasComponent(entity, PositionalAudioTagComponent))
    addComponent(entity, PositionalAudioTagComponent, true)

  if (currentPath !== el.src) {
    el.addEventListener(
      'loadeddata',
      () => {
        el.muted = false
        if (el.autoplay) {
          if (getEngineState().userHasInteracted.value) {
            el.play()
          } else {
            matchActionOnce(EngineActions.setUserHasInteracted.matches, () => {
              el.play()
              return true
            })
          }

          if (!Engine.instance.isEditor) updateAutoStartTimeForMedia(entity)
        }
      },
      { once: true }
    )
    el.src = currentPath
  }

  if (el.volume !== audioComponent.volume) el.volume = audioComponent.volume

  // if (hasComponent(entity, PositionalAudioTagComponent)) {
  //   if (audioTypeChanged || audioComponent.distanceModel !== audioEl.getDistanceModel())
  //     audioEl.setDistanceModel(audioComponent.distanceModel)
  //   if (audioTypeChanged || audioComponent.rolloffFactor !== audioEl.getRolloffFactor())
  //     audioEl.setRolloffFactor(audioComponent.rolloffFactor)
  //   if (audioTypeChanged || audioComponent.refDistance !== audioEl.getRefDistance())
  //     audioEl.setRefDistance(audioComponent.refDistance)
  //   if (audioTypeChanged || audioComponent.maxDistance !== audioEl.getMaxDistance())
  //     audioEl.setMaxDistance(audioComponent.maxDistance)
  //   if (audioTypeChanged || audioComponent.coneInnerAngle !== audioEl.panner.coneInnerAngle)
  //     audioEl.panner.coneInnerAngle = audioComponent.coneInnerAngle
  //   if (audioTypeChanged || audioComponent.coneOuterAngle !== audioEl.panner.coneOuterAngle)
  //     audioEl.panner.coneOuterAngle = audioComponent.coneOuterAngle
  //   if (audioTypeChanged || audioComponent.coneOuterGain !== audioEl.panner.coneOuterAngle)
  //     audioEl.panner.coneOuterGain = audioComponent.coneOuterGain
  // }
}

export const serializeAudio: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, AudioComponent) as AudioComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_AUDIO,
    props: {
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

export const prepareAudioForGLTFExport: ComponentPrepareForGLTFExportFunction = (obj3d) => {
  AudioElementObjects.get(obj3d)!.removeFromParent()
}

export const parseAudioProperties = (props): AudioComponentType => {
  return {
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
