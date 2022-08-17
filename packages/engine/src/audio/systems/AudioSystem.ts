import { Not } from 'bitecs'

import { addActionReceptor, createActionQueue, getState } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isSafari } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { CallbackComponent } from '../../scene/components/CallbackComponent'
import { MediaComponent } from '../../scene/components/MediaComponent'
import { MediaElementComponent } from '../../scene/components/MediaElementComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VideoComponent } from '../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import {
  AUDIO_TEXTURE_PATH,
  AudioElementObjects,
  updateAudioParameters,
  updateAudioPrefab
} from '../../scene/functions/loaders/AudioFunctions'
import { updateVideo } from '../../scene/functions/loaders/VideoFunctions'
import { updateVolumetric } from '../../scene/functions/loaders/VolumetricFunctions'
import { accessAudioState, AudioSettingReceptor, AudioState, restoreAudioSettings } from '../AudioState'
import { AudioComponent } from '../components/AudioComponent'

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

export type AudioElementNode = {
  gain: GainNode
  source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode
  panner?: PannerNode
}

export const AudioElementNodes = new WeakMap<HTMLMediaElement | MediaStream, AudioElementNode>()

export default async function AudioSystem(world: World) {
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
  if (isSafari) {
    window.addEventListener('pointerdown', playmedia)
  }

  return () => {
    const audioEntities = audioQuery()
    const videoEntities = videoQuery()
    const volEntities = volQuery()

    if (userInteractActionQueue().length) {
      enableAudioContext()
    }

    for (const entity of audioQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent, true)?.value
      AudioElementObjects.get(obj3d)?.removeFromParent()
    }

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (audioEntities.includes(entity)) updateAudioPrefab(entity)
        if (videoEntities.includes(entity)) updateVideo(entity)
        if (volEntities.includes(entity)) updateVolumetric(entity)
        if (hasComponent(entity, AudioComponent)) updateAudioParameters(entity)
      }
    }
  }
}
