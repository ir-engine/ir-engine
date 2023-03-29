import _ from 'lodash'

import logger from '@etherealengine/common/src/logger'
import {
  addActionReceptor,
  createActionQueue,
  getMutableState,
  getState,
  hookstate,
  removeActionQueue,
  State
} from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Scene } from '../../ecs/classes/Scene'
import { defineQuery, getComponent, getMutableComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { MediaSettingReceptor } from '../../networking/MediaSettingsState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { setCallback, StandardCallbacks } from '../../scene/components/CallbackComponent'
import { MediaComponent, MediaElementComponent, SCENE_COMPONENT_MEDIA } from '../../scene/components/MediaComponent'
import { SCENE_COMPONENT_VIDEO, VideoComponent } from '../../scene/components/VideoComponent'
import { SCENE_COMPONENT_VISIBLE } from '../../scene/components/VisibleComponent'
import { SCENE_COMPONENT_VOLUMETRIC, VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { enterVolumetric, updateVolumetric } from '../../scene/functions/loaders/VolumetricFunctions'
import { defaultSpatialComponents } from '../../scene/systems/SceneObjectUpdateSystem'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '../../transform/components/TransformComponent'
import { accessAudioState, AudioSettingReceptor, AudioState } from '../AudioState'
import {
  PositionalAudioComponent,
  SCENE_COMPONENT_AUDIO as SCENE_COMPONENT_POSITIONAL_AUDIO
} from '../components/PositionalAudioComponent'

export class AudioEffectPlayer {
  static instance = new AudioEffectPlayer()

  constructor() {
    // only init when running in client
    if (isClient) {
      this.#init()
    }
  }

  static SOUNDS = {
    notification: '/sfx/notification.mp3',
    message: '/sfx/message.mp3',
    alert: '/sfx/alert.mp3',
    ui: '/sfx/ui.mp3'
  }

  bufferMap = {} as { [path: string]: AudioBuffer }

  loadBuffer = async (path: string) => {
    const buffer = await AssetLoader.loadAsync(path)
    this.bufferMap[path] = buffer
  }

  // pool of elements
  #els: HTMLAudioElement[] = []

  #init() {
    if (this.#els.length) return
    for (let i = 0; i < 20; i++) {
      const audioElement = document.createElement('audio')
      audioElement.loop = false
      this.#els.push(audioElement)
    }
  }

  play = async (sound: string, volumeMultiplier = getMutableState(AudioState).notificationVolume.value) => {
    await Promise.resolve()

    if (!this.#els.length) return

    if (!this.bufferMap[sound]) {
      logger.error('[AudioEffectPlayer]: Buffer not found for source: ', sound)
      return
    }

    const source = getState(AudioState).audioContext.createBufferSource()
    source.buffer = this.bufferMap[sound]
    const el = this.#els.find((el) => el.paused) ?? this.#els[0]
    el.volume = accessAudioState().masterVolume.value * volumeMultiplier
    if (el.src !== sound) el.src = sound
    el.currentTime = 0
    source.start()
    source.connect(getState(AudioState).audioContext.destination)
  }
}

globalThis.AudioEffectPlayer = AudioEffectPlayer

export const MediaPrefabs = {
  audio: 'Audio' as const,
  video: 'Video' as const,
  volumetric: 'Volumetric' as const
}

export const DefaultMediaState = {
  immersiveMedia: false,
  refDistance: 20,
  rolloffFactor: 1,
  maxDistance: 10000,
  distanceModel: 'linear' as DistanceModelType,
  coneInnerAngle: 360,
  coneOuterAngle: 0,
  coneOuterGain: 0
}

export type MediaState = State<typeof DefaultMediaState>

export const MediaSceneMetadataLabel = 'mediaSettings'

export const getMediaSceneMetadataState = (scene: Scene) =>
  scene.sceneMetadataRegistry[MediaSceneMetadataLabel].state as MediaState

export default async function MediaSystem() {
  const audioContext = getState(AudioState).audioContext

  const enableAudioContext = () => {
    if (audioContext.state === 'suspended') audioContext.resume()
  }

  if (isClient && !getMutableState(EngineState).isEditor.value) {
    // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
    // in order to ensure media will play programmatically
    const mediaQuery = defineQuery([MediaComponent, MediaElementComponent])
    function handleAutoplay() {
      enableAudioContext()
      for (const entity of mediaQuery()) {
        const mediaElement = getComponent(entity, MediaElementComponent)
        const media = getComponent(entity, MediaComponent)
        if (!media.paused && mediaElement?.element.paused) mediaElement.element.play()
      }
    }
    // TODO: add destroy callbacks
    window.addEventListener('pointerdown', handleAutoplay)
    window.addEventListener('keypress', handleAutoplay)
    window.addEventListener('touchstart', handleAutoplay)
    EngineRenderer.instance.renderer.domElement.addEventListener('pointerdown', handleAutoplay)
    EngineRenderer.instance.renderer.domElement.addEventListener('touchstart', handleAutoplay)
  }

  Engine.instance.currentScene.sceneMetadataRegistry[MediaSceneMetadataLabel] = {
    state: hookstate(_.cloneDeep(DefaultMediaState)),
    default: DefaultMediaState
  }

  Engine.instance.scenePrefabRegistry.set(MediaPrefabs.audio, [
    { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
    { name: SCENE_COMPONENT_VISIBLE, props: true },
    { name: SCENE_COMPONENT_MEDIA, props: { paths: ['__$project$__/default-project/assets/SampleAudio.mp3'] } },
    { name: SCENE_COMPONENT_POSITIONAL_AUDIO, props: {} }
  ])

  Engine.instance.scenePrefabRegistry.set(MediaPrefabs.video, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MEDIA, props: { paths: ['__$project$__/default-project/assets/SampleVideo.mp4'] } },
    { name: SCENE_COMPONENT_POSITIONAL_AUDIO, props: {} },
    { name: SCENE_COMPONENT_VIDEO, props: {} }
  ])

  Engine.instance.scenePrefabRegistry.set(MediaPrefabs.volumetric, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_MEDIA, props: {} },
    { name: SCENE_COMPONENT_POSITIONAL_AUDIO, props: {} },
    { name: SCENE_COMPONENT_VOLUMETRIC, props: {} }
  ])

  Engine.instance.sceneComponentRegistry.set(PositionalAudioComponent.name, SCENE_COMPONENT_POSITIONAL_AUDIO)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_POSITIONAL_AUDIO, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(VideoComponent.name, SCENE_COMPONENT_VIDEO)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_VIDEO, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(MediaComponent.name, SCENE_COMPONENT_MEDIA)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_MEDIA, {
    defaultData: {}
  })

  Engine.instance.sceneComponentRegistry.set(VolumetricComponent.name, SCENE_COMPONENT_VOLUMETRIC)
  Engine.instance.sceneLoadingRegistry.set(SCENE_COMPONENT_VOLUMETRIC, {
    defaultData: {}
  })

  const audioState = getMutableState(AudioState)
  const currentTime = audioState.audioContext.currentTime.value

  audioState.cameraGainNode.gain.value.setTargetAtTime(audioState.masterVolume.value, currentTime, 0.01)

  /** create gain nodes for mix buses */
  audioState.gainNodeMixBuses.mediaStreams.set(audioContext.createGain())
  audioState.gainNodeMixBuses.mediaStreams.value.connect(audioState.cameraGainNode.value)
  audioState.gainNodeMixBuses.mediaStreams.value.gain.setTargetAtTime(
    audioState.mediaStreamVolume.value,
    currentTime,
    0.01
  )

  audioState.gainNodeMixBuses.notifications.set(audioContext.createGain())
  audioState.gainNodeMixBuses.notifications.value.connect(audioState.cameraGainNode.value)
  audioState.gainNodeMixBuses.notifications.value.gain.setTargetAtTime(
    audioState.notificationVolume.value,
    currentTime,
    0.01
  )

  audioState.gainNodeMixBuses.music.set(audioContext.createGain())
  audioState.gainNodeMixBuses.music.value.connect(audioState.cameraGainNode.value)
  audioState.gainNodeMixBuses.music.value.gain.setTargetAtTime(
    audioState.backgroundMusicVolume.value,
    currentTime,
    0.01
  )

  audioState.gainNodeMixBuses.soundEffects.set(audioContext.createGain())
  audioState.gainNodeMixBuses.soundEffects.value.connect(audioState.cameraGainNode.value)
  audioState.gainNodeMixBuses.soundEffects.value.gain.setTargetAtTime(
    audioState.soundEffectsVolume.value,
    currentTime,
    0.01
  )

  addActionReceptor(AudioSettingReceptor)
  addActionReceptor(MediaSettingReceptor)

  const mediaQuery = defineQuery([MediaComponent])
  const videoQuery = defineQuery([VideoComponent])
  const volumetricQuery = defineQuery([VolumetricComponent, MediaElementComponent])
  const audioQuery = defineQuery([PositionalAudioComponent])

  Object.values(AudioEffectPlayer.SOUNDS).map((sound) => AudioEffectPlayer.instance.loadBuffer(sound))

  const execute = () => {
    for (const entity of mediaQuery.enter()) {
      const media = getMutableComponent(entity, MediaComponent)
      setCallback(entity, StandardCallbacks.PLAY, () => media.paused.set(false))
      setCallback(entity, StandardCallbacks.PAUSE, () => media.paused.set(true))
    }

    for (const entity of volumetricQuery.enter()) {
      enterVolumetric(entity)
    }
    for (const entity of volumetricQuery()) updateVolumetric(entity)
    for (const entity of audioQuery()) getComponent(entity, PositionalAudioComponent).helper?.update()
  }

  const cleanup = async () => {
    Engine.instance.scenePrefabRegistry.delete(MediaPrefabs.audio)
    Engine.instance.scenePrefabRegistry.delete(MediaPrefabs.video)
    Engine.instance.scenePrefabRegistry.delete(MediaPrefabs.volumetric)
    Engine.instance.sceneComponentRegistry.delete(PositionalAudioComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_POSITIONAL_AUDIO)
    Engine.instance.sceneComponentRegistry.delete(VideoComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_VIDEO)
    Engine.instance.sceneComponentRegistry.delete(MediaComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_MEDIA)
    Engine.instance.sceneComponentRegistry.delete(VolumetricComponent.name)
    Engine.instance.sceneLoadingRegistry.delete(SCENE_COMPONENT_VOLUMETRIC)

    audioState.gainNodeMixBuses.mediaStreams.value.disconnect()
    audioState.gainNodeMixBuses.mediaStreams.set(null!)
    audioState.gainNodeMixBuses.notifications.value.disconnect()
    audioState.gainNodeMixBuses.notifications.set(null!)
    audioState.gainNodeMixBuses.music.value.disconnect()
    audioState.gainNodeMixBuses.music.set(null!)
    audioState.gainNodeMixBuses.soundEffects.value.disconnect()
    audioState.gainNodeMixBuses.soundEffects.set(null!)

    removeQuery(mediaQuery)
    removeQuery(videoQuery)
    removeQuery(volumetricQuery)

    for (const sound of Object.values(AudioEffectPlayer.SOUNDS)) delete AudioEffectPlayer.instance.bufferMap[sound]
  }

  return { execute, cleanup }
}
