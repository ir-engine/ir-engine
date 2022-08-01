import { Not } from 'bitecs'
import { Audio, Object3D, PositionalAudio } from 'three'

import { addActionReceptor, createActionQueue, dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VideoComponent } from '../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { AUDIO_TEXTURE_PATH, AudioElementObjects, updateAudio } from '../../scene/functions/loaders/AudioFunctions'
import { updateVideo } from '../../scene/functions/loaders/VideoFunctions'
import { updateVolumetric } from '../../scene/functions/loaders/VolumetricFunctions'
import { accessAudioState, AudioSettingAction, AudioSettingReceptor, restoreAudioSettings } from '../AudioState'
import { AudioComponent } from '../components/AudioComponent'

export class AudioEffectPlayer {
  static instance = new AudioEffectPlayer()

  static SOUNDS = {
    notification: '/sfx/notification.mp3',
    message: '/sfx/message.mp3',
    alert: '/sfx/alert.mp3',
    ui: '/sfx/ui.mp3'
  }

  #el: HTMLAudioElement

  _init() {
    const audioElement = document.createElement('audio')
    audioElement.loop = false
    this.#el = audioElement
  }

  play(sound: string, volumeMultiplier = 1) {
    if (!this.#el) return
    this.#el.volume = accessAudioState().audio.value * volumeMultiplier * 0.01
    if (this.#el.src !== sound) this.#el.src = sound
    this.#el.currentTime = 0
    this.#el.play()
  }
}

globalThis.AudioEffectPlayer = AudioEffectPlayer

export default async function AudioSystem(world: World) {
  await AssetLoader.loadAsync(AUDIO_TEXTURE_PATH)

  let audioReady = false
  let callbacks: any[] = []
  let audio: any

  const whenReady = (cb): void => {
    if (audioReady) {
      cb()
    } else {
      callbacks.push(cb)
    }
  }

  const startAudio = (e) => {
    window.removeEventListener('pointerdown', startAudio, true)
    console.log('starting audio')
    audioReady = true
    Engine.instance.currentWorld.audioListener.context.resume()
    dispatchAction(EngineActions.startSuspendedContexts({}))

    callbacks.forEach((cb) => cb())
    callbacks = null!
  }
  window.addEventListener('pointerdown', startAudio, true)

  matchActionOnce(EngineActions.joinedWorld.matches, () => {
    restoreAudioSettings()
  })

  addActionReceptor(AudioSettingReceptor)

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)
  const userInteractActionQueue = createActionQueue(EngineActions.setUserHasInteracted.matches)

  const audioQuery = defineQuery([AudioComponent, Not(VideoComponent), Not(VolumetricComponent)])
  const videoQuery = defineQuery([AudioComponent, VideoComponent, Not(VolumetricComponent)])
  const volQuery = defineQuery([AudioComponent, Not(VideoComponent), VolumetricComponent])

  return () => {
    for (const action of userInteractActionQueue()) {
      AudioEffectPlayer.instance._init()
    }

    for (const entity of audioQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent).value
      AudioElementObjects.get(obj3d)?.removeFromParent()
    }

    const audioEntities = audioQuery()
    const videoEntities = videoQuery()
    const volEntities = volQuery()

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (audioEntities.includes(entity)) updateAudio(entity)
        if (videoEntities.includes(entity)) updateVideo(entity)
        if (volEntities.includes(entity)) updateVolumetric(entity)
      }
    }
  }
}
