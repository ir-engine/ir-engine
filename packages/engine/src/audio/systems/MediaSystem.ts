/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { VideoTexture } from 'three'

import { addActionReceptor, getMutableState, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { StandardCallbacks, setCallback } from '../../scene/components/CallbackComponent'
import { MediaComponent, MediaElementComponent } from '../../scene/components/MediaComponent'
import { VideoComponent, VideoTexturePriorityQueueState } from '../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { enterVolumetric, updateVolumetric } from '../../scene/functions/loaders/VolumetricFunctions'
import { AudioSettingReceptor, AudioState } from '../AudioState'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'

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
    return buffer
  }

  // pool of elements
  #els: HTMLAudioElement[] = []

  #init() {
    if (this.#els.length) return
    for (let i = 0; i < 20; i++) {
      const audioElement = document.createElement('audio')
      audioElement.crossOrigin = 'anonymous'
      audioElement.loop = false
      this.#els.push(audioElement)
    }
  }

  play = async (sound: string, volumeMultiplier = getState(AudioState).notificationVolume) => {
    await Promise.resolve()

    if (!this.#els.length) return

    if (!this.bufferMap[sound]) {
      // create buffer if doesn't exist
      this.bufferMap[sound] = await AudioEffectPlayer?.instance?.loadBuffer(sound)
    }

    const source = getState(AudioState).audioContext.createBufferSource()
    source.buffer = this.bufferMap[sound]
    const el = this.#els.find((el) => el.paused) ?? this.#els[0]
    el.volume = getState(AudioState).masterVolume * volumeMultiplier
    if (el.src !== sound) el.src = sound
    el.currentTime = 0
    source.start()
    source.connect(getState(AudioState).audioContext.destination)
  }
}

globalThis.AudioEffectPlayer = AudioEffectPlayer

const mediaQuery = defineQuery([MediaComponent])
const videoQuery = defineQuery([VideoComponent])
const volumetricQuery = defineQuery([VolumetricComponent, MediaElementComponent])
const audioQuery = defineQuery([PositionalAudioComponent])

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

  const videoPriorityQueue = getState(VideoTexturePriorityQueueState).queue

  /** Use a priority queue with videos to ensure only a few are updated each frame */
  for (const entity of VideoComponent.uniqueVideoEntities) {
    const videoTexture = getComponent(entity, VideoComponent).videoMesh.material.map as VideoTexture
    if (videoTexture?.isVideoTexture) {
      const video = videoTexture.image
      const hasVideoFrameCallback = 'requestVideoFrameCallback' in video
      if (hasVideoFrameCallback === false || video.readyState < video.HAVE_CURRENT_DATA) continue
      videoPriorityQueue.addPriority(entity, 1)
    }
  }

  videoPriorityQueue.update()

  for (const entity of videoPriorityQueue.priorityEntities) {
    if (!hasComponent(entity, VideoComponent)) continue
    const videoComponent = getComponent(entity, VideoComponent)
    const videoTexture = videoComponent.videoMesh.material.map as VideoTexture
    if (!videoTexture?.isVideoTexture) continue
    videoTexture.needsUpdate = true
  }
}

const reactor = () => {
  useEffect(() => {
    const audioContext = getState(AudioState).audioContext

    const enableAudioContext = () => {
      if (audioContext.state === 'suspended') audioContext.resume()
    }

    if (isClient && !getState(EngineState).isEditor) {
      // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
      // in order to ensure media will play programmatically
      const mediaQuery = defineQuery([MediaComponent, MediaElementComponent])
      const handleAutoplay = () => {
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

    return () => {
      audioState.gainNodeMixBuses.mediaStreams.value.disconnect()
      audioState.gainNodeMixBuses.mediaStreams.set(null!)
      audioState.gainNodeMixBuses.notifications.value.disconnect()
      audioState.gainNodeMixBuses.notifications.set(null!)
      audioState.gainNodeMixBuses.music.value.disconnect()
      audioState.gainNodeMixBuses.music.set(null!)
      audioState.gainNodeMixBuses.soundEffects.value.disconnect()
      audioState.gainNodeMixBuses.soundEffects.set(null!)

      for (const sound of Object.values(AudioEffectPlayer.SOUNDS)) delete AudioEffectPlayer.instance.bufferMap[sound]
    }
  }, [])
  return null
}

export const MediaSystem = defineSystem({
  uuid: 'ee.engine.MediaSystem',
  execute,
  reactor
})
