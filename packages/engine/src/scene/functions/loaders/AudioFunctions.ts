import { getState } from '@xrengine/hyperflux'

import { AudioState } from '../../../audio/AudioState'
import {
  AudioComponent,
  AudioComponentType,
  SCENE_COMPONENT_AUDIO_DEFAULT_VALUES
} from '../../../audio/components/AudioComponent'
import { AudioElementNode, AudioElementNodes } from '../../../audio/systems/AudioSystem'
import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { CallbackComponent } from '../../components/CallbackComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { MediaElementComponent } from '../../components/MediaElementComponent'
import { PlayMode } from '../../constants/PlayMode'
import { getNextPlaylistItem, updateAutoStartTimeForMedia } from './MediaFunctions'

export const deserializeAudio: ComponentDeserializeFunction = async (entity: Entity, data: AudioComponentType) => {
  const props = parseAudioProperties(data)
  setComponent(entity, AudioComponent, props)
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

  const currentPath = mediaComponent.paths.length ? mediaComponent.paths[mediaComponent.currentSource] : ''

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
