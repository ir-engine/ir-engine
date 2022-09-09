import { addActionReceptor, createActionQueue, getState } from '@xrengine/hyperflux'

import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaSettingReceptor, restoreMediaSettings } from '../../networking/MediaSettingsState'
import { setCallback } from '../../scene/components/CallbackComponent'
import {
  MediaCallbacks as MediaCallback,
  MediaComponent,
  MediaElementComponent,
  SCENE_COMPONENT_MEDIA
} from '../../scene/components/MediaComponent'
import { SCENE_COMPONENT_VIDEO, VideoComponent } from '../../scene/components/VideoComponent'
import { SCENE_COMPONENT_VISIBLE } from '../../scene/components/VisibleComponent'
import { SCENE_COMPONENT_VOLUMETRIC, VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { deserializeMedia, serializeMedia } from '../../scene/functions/loaders/MediaFunctions'
import {
  deserializePositionalAudio,
  serializePositionalAudio
} from '../../scene/functions/loaders/PositionalAudioFunctions'
import { deserializeVideo, enterVideo, serializeVideo } from '../../scene/functions/loaders/VideoFunctions'
import {
  deserializeVolumetric,
  enterVolumetric,
  serializeVolumetric,
  updateVolumetric
} from '../../scene/functions/loaders/VolumetricFunctions'
import { defaultSpatialComponents } from '../../scene/systems/SceneObjectUpdateSystem'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import { accessAudioState, AudioSettingReceptor, AudioState, restoreAudioSettings } from '../AudioState'
import {
  PositionalAudioComponent,
  SCENE_COMPONENT_AUDIO as SCENE_COMPONENT_POSITIONAL_AUDIO
} from '../components/PositionalAudioComponent'

export class AudioEffectPlayer {
  static instance = new AudioEffectPlayer()

  static SOUNDS = {
    notification: '/sfx/notification.mp3',
    message: '/sfx/message.mp3',
    alert: '/sfx/alert.mp3',
    ui: '/sfx/ui.mp3'
  }

  // pool of elements
  #els: HTMLAudioElement[] = []

  _init() {
    for (let i = 0; i < 4; i++) {
      const audioElement = document.createElement('audio')
      audioElement.loop = false
      this.#els.push(audioElement)
    }
  }

  play(sound: string, volumeMultiplier = getState(AudioState).notificationVolume.value) {
    if (!this.#els.length) return
    const el = this.#els.find((el) => el.paused) ?? this.#els[0]
    el.volume = accessAudioState().masterVolume.value * volumeMultiplier
    if (el.src !== sound) el.src = sound
    el.currentTime = 0
    el.play()
  }
}

globalThis.AudioEffectPlayer = AudioEffectPlayer

export const MediaPrefabs = {
  audio: 'Audio' as const,
  video: 'Video' as const,
  volumetric: 'Volumetric' as const
}

export const AudioNodeGroups = new WeakMap<HTMLMediaElement | MediaStream, AudioNodeGroup>()

export type AudioNodeGroup = {
  source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode
  gain: GainNode
  panner?: PannerNode
  mixbus: GainNode
}

export const createAudioNodeGroup = (
  el: HTMLMediaElement | MediaStream,
  source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode,
  mixbus: GainNode
) => {
  const gain = Engine.instance.audioContext.createGain()
  source.connect(gain)
  gain.connect(mixbus)
  const panner = Engine.instance.audioContext.createPanner()
  const group = { source, gain, mixbus, panner } as AudioNodeGroup
  AudioNodeGroups.set(el, group)
  return group
}

// TODO: move this into system initializer once we have system destroy callbacks
if (isClient) {
  const mediaQuery = defineQuery([MediaComponent, MediaElementComponent])

  // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
  // in order to ensure media will play programmatically
  function handleAutoplay() {
    if (!Engine.instance)
      for (const entity of mediaQuery()) {
        const media = getComponent(entity, MediaComponent)
        if (media.playing.value) return
        if (media.paused.value) return
        getComponent(entity, MediaElementComponent)?.element.play()
      }
  }

  window.addEventListener('pointerdown', handleAutoplay)
  window.addEventListener('keypress', handleAutoplay)
}

export default async function MediaSystem(world: World) {
  world.scenePrefabRegistry.set(MediaPrefabs.audio, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_MEDIA, props: { paths: ['__$project$__/default-project/assets/SampleAudio.mp3'] } },
    { name: SCENE_COMPONENT_POSITIONAL_AUDIO, props: {} }
  ])

  world.scenePrefabRegistry.set(MediaPrefabs.video, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MEDIA, props: { paths: ['__$project$__/default-project/assets/SampleVideo.mp4'] } },
    { name: SCENE_COMPONENT_POSITIONAL_AUDIO, props: {} },
    { name: SCENE_COMPONENT_VIDEO, props: {} }
  ])

  world.scenePrefabRegistry.set(MediaPrefabs.volumetric, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MEDIA, props: {} }, // todo: add sample volumetric
    { name: SCENE_COMPONENT_POSITIONAL_AUDIO, props: {} },
    { name: SCENE_COMPONENT_VOLUMETRIC, props: {} }
  ])

  world.sceneComponentRegistry.set(PositionalAudioComponent._name, SCENE_COMPONENT_POSITIONAL_AUDIO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POSITIONAL_AUDIO, {
    defaultData: {},
    deserialize: deserializePositionalAudio,
    serialize: serializePositionalAudio
  })

  world.sceneComponentRegistry.set(VideoComponent._name, SCENE_COMPONENT_VIDEO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VIDEO, {
    defaultData: {},
    deserialize: deserializeVideo,
    serialize: serializeVideo
  })

  world.sceneComponentRegistry.set(MediaComponent._name, SCENE_COMPONENT_MEDIA)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MEDIA, {
    defaultData: {},
    deserialize: deserializeMedia,
    serialize: serializeMedia
  })

  world.sceneComponentRegistry.set(VolumetricComponent._name, SCENE_COMPONENT_VOLUMETRIC)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VOLUMETRIC, {
    defaultData: {},
    deserialize: deserializeVolumetric,
    serialize: serializeVolumetric
  })

  /** create gain nodes for mix buses */
  Engine.instance.gainNodeMixBuses.mediaStreams = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.mediaStreams.connect(Engine.instance.cameraGainNode)
  Engine.instance.gainNodeMixBuses.notifications = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.notifications.connect(Engine.instance.cameraGainNode)
  Engine.instance.gainNodeMixBuses.music = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.music.connect(Engine.instance.cameraGainNode)
  Engine.instance.gainNodeMixBuses.soundEffects = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.soundEffects.connect(Engine.instance.cameraGainNode)

  restoreAudioSettings()
  restoreMediaSettings()

  addActionReceptor(AudioSettingReceptor)
  addActionReceptor(MediaSettingReceptor)

  const userInteractActionQueue = createActionQueue(EngineActions.setUserHasInteracted.matches)

  const mediaQuery = defineQuery([MediaComponent])
  const videoQuery = defineQuery([MediaElementComponent, VideoComponent])
  const volumetricQuery = defineQuery([MediaElementComponent, VolumetricComponent])

  const enableAudioContext = () => {
    if (Engine.instance.audioContext.state === 'suspended') Engine.instance.audioContext.resume()
    AudioEffectPlayer.instance._init()
  }

  return () => {
    if (userInteractActionQueue().length) {
      enableAudioContext()
    }

    for (const entity of mediaQuery.enter()) {
      const media = getComponent(entity, MediaComponent)
      setCallback(entity, MediaCallback.PLAY, () => media.paused.set(false))
      setCallback(entity, MediaCallback.PAUSE, () => media.paused.set(true))
    }

    for (const entity of videoQuery.enter()) enterVideo(entity)
    for (const entity of volumetricQuery.enter()) enterVolumetric(entity)
    for (const entity of volumetricQuery()) updateVolumetric(entity)
  }
}
