import _ from 'lodash'

import logger from '@etherealengine/common/src/logger'
import {
  addActionReceptor,
  createActionQueue,
  getState,
  hookstate,
  removeActionQueue,
  State
} from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, getComponentState, removeQuery } from '../../ecs/functions/ComponentFunctions'
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

  _init() {
    if (this.#els.length) return
    for (let i = 0; i < 20; i++) {
      const audioElement = document.createElement('audio')
      audioElement.loop = false
      this.#els.push(audioElement)
    }
  }

  play = async (sound: string, volumeMultiplier = getState(AudioState).notificationVolume.value) => {
    await Promise.resolve()

    if (!this.#els.length) return

    if (!this.bufferMap[sound]) {
      logger.error('[AudioEffectPlayer]: Buffer not found for source: ', sound)
      return
    }

    const source = Engine.instance.audioContext.createBufferSource()
    source.buffer = this.bufferMap[sound]
    const el = this.#els.find((el) => el.paused) ?? this.#els[0]
    el.volume = accessAudioState().masterVolume.value * volumeMultiplier
    if (el.src !== sound) el.src = sound
    el.currentTime = 0
    source.start()
    source.connect(Engine.instance.audioContext.destination)
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

export const getMediaSceneMetadataState = (world: World) =>
  world.sceneMetadataRegistry[MediaSceneMetadataLabel].state as MediaState

export default async function MediaSystem(world: World) {
  const enableAudioContext = () => {
    if (Engine.instance.audioContext.state === 'suspended') Engine.instance.audioContext.resume()
    AudioEffectPlayer.instance._init()
  }

  if (isClient && !Engine.instance.isEditor) {
    // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
    // in order to ensure media will play programmatically
    const mediaQuery = defineQuery([MediaComponent, MediaElementComponent])
    function handleAutoplay() {
      enableAudioContext()

      for (const entity of mediaQuery()) {
        const media = getComponentState(entity, MediaComponent)
        if (media.playing.value) return
        if (media.paused.value && media.autoplay.value) media.paused.set(false)
        // safari requires play() to be called in the DOM handle function
        getComponent(entity, MediaElementComponent)?.element.play()
      }
    }
    // TODO: add destroy callbacks
    window.addEventListener('pointerdown', handleAutoplay)
    window.addEventListener('keypress', handleAutoplay)
    window.addEventListener('touchstart', handleAutoplay)
    EngineRenderer.instance.renderer.domElement.addEventListener('pointerdown', handleAutoplay)
    EngineRenderer.instance.renderer.domElement.addEventListener('touchstart', handleAutoplay)
  }

  world.sceneMetadataRegistry[MediaSceneMetadataLabel] = {
    state: hookstate(_.cloneDeep(DefaultMediaState)),
    default: DefaultMediaState
  }

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
    { name: SCENE_COMPONENT_MEDIA, props: {} },
    { name: SCENE_COMPONENT_POSITIONAL_AUDIO, props: {} },
    { name: SCENE_COMPONENT_VOLUMETRIC, props: {} }
  ])

  world.sceneComponentRegistry.set(PositionalAudioComponent.name, SCENE_COMPONENT_POSITIONAL_AUDIO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_POSITIONAL_AUDIO, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(VideoComponent.name, SCENE_COMPONENT_VIDEO)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VIDEO, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(MediaComponent.name, SCENE_COMPONENT_MEDIA)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_MEDIA, {
    defaultData: {}
  })

  world.sceneComponentRegistry.set(VolumetricComponent.name, SCENE_COMPONENT_VOLUMETRIC)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_VOLUMETRIC, {
    defaultData: {}
  })

  const audioState = getState(AudioState)
  const currentTime = Engine.instance.audioContext.currentTime

  Engine.instance.cameraGainNode.gain.setTargetAtTime(audioState.masterVolume.value, currentTime, 0.01)

  /** create gain nodes for mix buses */
  Engine.instance.gainNodeMixBuses.mediaStreams = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.mediaStreams.connect(Engine.instance.cameraGainNode)
  Engine.instance.gainNodeMixBuses.mediaStreams.gain.setTargetAtTime(
    audioState.mediaStreamVolume.value,
    currentTime,
    0.01
  )

  Engine.instance.gainNodeMixBuses.notifications = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.notifications.connect(Engine.instance.cameraGainNode)
  Engine.instance.gainNodeMixBuses.notifications.gain.setTargetAtTime(
    audioState.notificationVolume.value,
    currentTime,
    0.01
  )

  Engine.instance.gainNodeMixBuses.music = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.music.connect(Engine.instance.cameraGainNode)
  Engine.instance.gainNodeMixBuses.music.gain.setTargetAtTime(audioState.backgroundMusicVolume.value, currentTime, 0.01)

  Engine.instance.gainNodeMixBuses.soundEffects = Engine.instance.audioContext.createGain()
  Engine.instance.gainNodeMixBuses.soundEffects.connect(Engine.instance.cameraGainNode)
  Engine.instance.gainNodeMixBuses.soundEffects.gain.setTargetAtTime(
    audioState.soundEffectsVolume.value,
    currentTime,
    0.01
  )

  addActionReceptor(AudioSettingReceptor)
  addActionReceptor(MediaSettingReceptor)

  const userInteractActionQueue = createActionQueue(EngineActions.setUserHasInteracted.matches)

  const mediaQuery = defineQuery([MediaComponent])
  const videoQuery = defineQuery([VideoComponent])
  const volumetricQuery = defineQuery([VolumetricComponent, MediaElementComponent])
  const audioQuery = defineQuery([PositionalAudioComponent])

  Object.values(AudioEffectPlayer.SOUNDS).map((sound) => AudioEffectPlayer.instance.loadBuffer(sound))

  const execute = () => {
    for (const entity of mediaQuery.enter()) {
      const media = getComponentState(entity, MediaComponent)
      setCallback(entity, StandardCallbacks.PLAY, () => media.paused.set(false))
      setCallback(entity, StandardCallbacks.PAUSE, () => media.paused.set(true))
    }

    for (const entity of volumetricQuery.enter()) enterVolumetric(entity)
    for (const entity of volumetricQuery()) updateVolumetric(entity)
    for (const entity of audioQuery()) getComponent(entity, PositionalAudioComponent).helper?.update()
  }

  const cleanup = async () => {
    world.scenePrefabRegistry.delete(MediaPrefabs.audio)
    world.scenePrefabRegistry.delete(MediaPrefabs.video)
    world.scenePrefabRegistry.delete(MediaPrefabs.volumetric)
    world.sceneComponentRegistry.delete(PositionalAudioComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_POSITIONAL_AUDIO)
    world.sceneComponentRegistry.delete(VideoComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_VIDEO)
    world.sceneComponentRegistry.delete(MediaComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_MEDIA)
    world.sceneComponentRegistry.delete(VolumetricComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_VOLUMETRIC)

    Engine.instance.gainNodeMixBuses.mediaStreams.disconnect()
    Engine.instance.gainNodeMixBuses.mediaStreams = null!
    Engine.instance.gainNodeMixBuses.notifications.disconnect()
    Engine.instance.gainNodeMixBuses.notifications = null!
    Engine.instance.gainNodeMixBuses.music.disconnect()
    Engine.instance.gainNodeMixBuses.music = null!
    Engine.instance.gainNodeMixBuses.soundEffects.disconnect()
    Engine.instance.gainNodeMixBuses.soundEffects = null!

    removeActionQueue(userInteractActionQueue)

    removeQuery(world, mediaQuery)
    removeQuery(world, videoQuery)
    removeQuery(world, volumetricQuery)

    for (const sound of Object.values(AudioEffectPlayer.SOUNDS)) delete AudioEffectPlayer.instance.bufferMap[sound]
  }

  return { execute, cleanup }
}
