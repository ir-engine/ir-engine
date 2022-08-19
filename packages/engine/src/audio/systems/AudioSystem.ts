import { Not } from 'bitecs'

import { addActionReceptor, createActionQueue, getState } from '@xrengine/hyperflux'

import { isSafari } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { CallbackComponent } from '../../scene/components/CallbackComponent'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { MediaElementComponent } from '../../scene/components/MediaElementComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VideoComponent } from '../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { deserializeAudio, SCENE_COMPONENT_AUDIO, SCENE_COMPONENT_AUDIO_DEFAULT_VALUES, serializeAudio, updateAudioParameters, updateAudioPrefab } from '../../scene/functions/loaders/AudioFunctions'
import { deserializeVideo, prepareVideoForGLTFExport, SCENE_COMPONENT_VIDEO, SCENE_COMPONENT_VIDEO_DEFAULT_VALUES, serializeVideo, updateVideo } from '../../scene/functions/loaders/VideoFunctions'
import { deserializeVolumetric, prepareVolumetricForGLTFExport, SCENE_COMPONENT_VOLUMETRIC, SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES, serializeVolumetric, updateVolumetric } from '../../scene/functions/loaders/VolumetricFunctions'
import { accessAudioState, AudioSettingReceptor, AudioState, restoreAudioSettings } from '../AudioState'
import { AudioComponent } from '../components/AudioComponent'
import { SCENE_COMPONENT_TRANSFORM, SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES } from '../../transform/components/TransformComponent'
import { SCENE_COMPONENT_VISIBLE } from '../../scene/components/VisibleComponent'
import { SCENE_COMPONENT_IMAGE, SCENE_COMPONENT_IMAGE_DEFAULT_VALUES } from '../../scene/functions/loaders/ImageFunctions'
import { deserializeMedia, SCENE_COMPONENT_MEDIA, SCENE_COMPONENT_MEDIA_DEFAULT_VALUES, serializeMedia } from '../../scene/functions/loaders/MediaFunctions'
import { defaultSpatialComponents } from '../../scene/functions/registerBaseSceneComponents'

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

export type AudioElementNode = {
  gain: GainNode
  source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode
  panner?: PannerNode
}

export const AudioElementNodes = new WeakMap<HTMLMediaElement | MediaStream, AudioElementNode>()

export default async function AudioSystem(world: World) {

  world.scenePrefabRegistry.set(MediaPrefabs.audio, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_MEDIA, props: SCENE_COMPONENT_MEDIA_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AUDIO, props: SCENE_COMPONENT_AUDIO_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(MediaPrefabs.video, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MEDIA, props: SCENE_COMPONENT_MEDIA_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AUDIO, props: SCENE_COMPONENT_AUDIO_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_IMAGE, props: SCENE_COMPONENT_IMAGE_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VIDEO, props: SCENE_COMPONENT_VIDEO_DEFAULT_VALUES }
  ])

  world.scenePrefabRegistry.set(MediaPrefabs.volumetric, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MEDIA, props: SCENE_COMPONENT_MEDIA_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_AUDIO, props: SCENE_COMPONENT_AUDIO_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VOLUMETRIC, props: SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(AudioComponent._name, SCENE_COMPONENT_AUDIO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_AUDIO, {
    defaultData: SCENE_COMPONENT_AUDIO_DEFAULT_VALUES,
    deserialize: deserializeAudio,
    serialize: serializeAudio
  })

  world.sceneComponentRegistry.set(VideoComponent._name, SCENE_COMPONENT_VIDEO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VIDEO, {
    defaultData: SCENE_COMPONENT_VIDEO_DEFAULT_VALUES,
    deserialize: deserializeVideo,
    serialize: serializeVideo,
    prepareForGLTFExport: prepareVideoForGLTFExport
  })

  world.sceneComponentRegistry.set(MediaComponent._name, SCENE_COMPONENT_MEDIA)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MEDIA, {
    defaultData: SCENE_COMPONENT_MEDIA_DEFAULT_VALUES,
    deserialize: deserializeMedia,
    serialize: serializeMedia
  })

  world.sceneComponentRegistry.set(VolumetricComponent._name, SCENE_COMPONENT_VOLUMETRIC)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VOLUMETRIC, {
    defaultData: SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES,
    deserialize: deserializeVolumetric,
    serialize: serializeVolumetric,
    prepareForGLTFExport: prepareVolumetricForGLTFExport
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

  addActionReceptor(AudioSettingReceptor)

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)
  const userInteractActionQueue = createActionQueue(EngineActions.setUserHasInteracted.matches)

  const audioQuery = defineQuery([Object3DComponent, AudioComponent, Not(VideoComponent), Not(VolumetricComponent)])
  const audioPrefabQuery = defineQuery([Object3DComponent, AudioComponent, Not(VideoComponent), Not(VolumetricComponent)])
  const videoQuery = defineQuery([Object3DComponent, AudioComponent, VideoComponent, Not(VolumetricComponent)])
  const volQuery = defineQuery([Object3DComponent, AudioComponent, Not(VideoComponent), VolumetricComponent])
  const mediaQuery = defineQuery([MediaComponent])

  const playmedia = () => {
    for (const entity of mediaQuery()) {
      const media = getComponent(entity, MediaElementComponent)
      if (media.autoplay) {
        media.muted = false
        getComponent(entity, CallbackComponent)?.play(null!)
      }
    }
  }

  const enableAudioContext = () => {
    if (Engine.instance.audioContext.state === 'suspended') Engine.instance.audioContext.resume()
    AudioEffectPlayer.instance._init()
    if (!Engine.instance.isEditor) playmedia()
  }

  /**
   * Safari only allows playing video programatically directly from a code path spawned from a click event
   */
  if (!Engine.instance.isEditor && isSafari) {
    window.addEventListener('pointerdown', playmedia)
  }

  return () => {
    const audioEntities = audioPrefabQuery()
    const videoEntities = videoQuery()
    const volEntities = volQuery()

    if (userInteractActionQueue().length) {
      enableAudioContext()
    }

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (audioEntities.includes(entity)) updateAudioPrefab(entity)
        if (videoEntities.includes(entity)) updateVideo(entity)
        if (volEntities.includes(entity)) updateVolumetric(entity)
        if (hasComponent(entity, AudioComponent)) updateAudioParameters(entity)
      }
    }

    for (const entity of audioPrefabQuery.enter()) updateAudioPrefab(entity)
    for (const entity of audioQuery.enter()) updateAudioParameters(entity)
    for (const entity of videoQuery.enter()) updateVideo(entity)
    for (const entity of volQuery.enter()) updateVolumetric(entity)
  }
}
