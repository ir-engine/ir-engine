/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { MeshBasicMaterial, VideoTexture } from 'three'

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getState, isClient } from '@ir-engine/hyperflux'
import { StandardCallbacks, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'

import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { getAudioAsync } from '../../assets/functions/resourceLoaderHooks'
import { VideoComponent, VideoTexturePriorityQueueState } from '../../scene/components/VideoComponent'
import { AudioState, useAudioState } from '../AudioState'
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

  bufferPromiseMap = {} as { [path: string]: Promise<AudioBuffer | null> }
  bufferMap = {} as { [path: string]: AudioBuffer }

  loadBuffer = async (path: string) => {
    const [buffer] = await getAudioAsync(path)
    return buffer
  }

  // pool of elements
  #els: HTMLAudioElement[] = []

  #init() {
    if (this.#els.length) return
    for (let i = 0; i < 4; i++) {
      const audioElement = document.createElement('audio')
      audioElement.crossOrigin = 'anonymous'
      audioElement.loop = false
      this.#els.push(audioElement)
    }
  }

  #queue = new Set<string>()

  play = (sound: string, volumeMultiplier = getState(AudioState).notificationVolume) => {
    const masterVolume = getState(AudioState).masterVolume
    if (!this.#els.length || volumeMultiplier === 0 || masterVolume === 0) return
    const audioContext = getState(AudioState).audioContext
    if (this.#queue.has(sound) || audioContext.state === 'suspended') return
    this.#queue.add(sound)

    if (!this.bufferPromiseMap[sound]) {
      // create buffer if doesn't exist
      this.bufferPromiseMap[sound] = this.loadBuffer(sound)
      this.bufferPromiseMap[sound].then((buffer) => {
        if (!buffer) return // keep in queue so we never request it again
        this.bufferMap[sound] = buffer
        this.#queue.delete(sound)
        this.play(sound, volumeMultiplier)
      })
      return
    }

    const source = audioContext.createBufferSource()
    source.buffer = this.bufferMap[sound]
    const el = this.#els.find((el) => el.paused) ?? this.#els[Math.floor(Math.random() * this.#els.length)]
    el.volume = masterVolume * volumeMultiplier
    if (el.src !== sound) el.src = sound
    el.currentTime = 0
    source.start()
    source.connect(audioContext.destination)
    this.#queue.delete(sound)
  }
}

globalThis.AudioEffectPlayer = AudioEffectPlayer

const mediaQuery = defineQuery([MediaComponent])
const videoQuery = defineQuery([VideoComponent])
const audioQuery = defineQuery([PositionalAudioComponent])

const execute = () => {
  for (const entity of mediaQuery.enter()) {
    const media = getMutableComponent(entity, MediaComponent)
    setCallback(entity, StandardCallbacks.PLAY, () => media.paused.set(false))
    setCallback(entity, StandardCallbacks.PAUSE, () => media.paused.set(true))
    setCallback(entity, StandardCallbacks.RESET, () => {
      media.paused.set(!media.autoplay.value)

      //using to force the react to update the seek time if already set to 0
      //due to media's seekTime is not being updated with the media elements current time
      let seekTime = media.seekTime.value
      if (seekTime == 0) {
        seekTime = 0.000001
      } else {
        seekTime = 0
      }
      media.seekTime.set(seekTime)
    })
  }

  const videoPriorityQueue = getState(VideoTexturePriorityQueueState).queue

  /** Use a priority queue with videos to ensure only a few are updated each frame */
  for (const entity of VideoComponent.uniqueVideoEntities) {
    const videoMeshEntity = getComponent(entity, VideoComponent).videoMeshEntity
    const videoMesh = getOptionalComponent(videoMeshEntity, MeshComponent)
    if (videoMesh) {
      const videoTexture = (videoMesh.material as MeshBasicMaterial)?.map as VideoTexture
      if (videoTexture?.isVideoTexture) {
        const video = videoTexture.image
        const hasVideoFrameCallback = 'requestVideoFrameCallback' in video
        if (hasVideoFrameCallback === false || video.readyState < video.HAVE_CURRENT_DATA) continue
        videoPriorityQueue.addPriority(entity, 1)
      }
    }
  }

  videoPriorityQueue.update()

  for (const entity of videoPriorityQueue.priorityEntities) {
    if (!hasComponent(entity, VideoComponent)) continue
    const videoMeshEntity = getComponent(entity, VideoComponent).videoMeshEntity
    const videoTexture = (getComponent(videoMeshEntity, MeshComponent)?.material as MeshBasicMaterial)
      ?.map as VideoTexture
    if (!videoTexture?.isVideoTexture) continue
    videoTexture.needsUpdate = true
  }
}

const reactor = () => {
  if (!isClient) return null

  useEffect(() => {
    const enableAudioContext = () => {
      const audioContext = getState(AudioState).audioContext
      if (audioContext.state === 'suspended') audioContext.resume()
    }

    // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
    // in order to ensure media will play programmatically
    const handleAutoplay = () => {
      enableAudioContext()
      window.removeEventListener('pointerup', handleAutoplay)
      window.removeEventListener('keypress', handleAutoplay)
      window.removeEventListener('touchend', handleAutoplay)
      window.removeEventListener('pointerup', handleAutoplay)
      window.removeEventListener('touchend', handleAutoplay)
    }
    // TODO: add destroy callbacks
    window.addEventListener('pointerup', handleAutoplay)
    window.addEventListener('keypress', handleAutoplay)
    window.addEventListener('touchend', handleAutoplay)
    window.addEventListener('pointerup', handleAutoplay)
    window.addEventListener('touchend', handleAutoplay)

    return () => {
      for (const sound of Object.values(AudioEffectPlayer.SOUNDS)) delete AudioEffectPlayer.instance.bufferMap[sound]
    }
  }, [])

  useAudioState()

  return null
}

export const MediaSystem = defineSystem({
  uuid: 'ee.engine.MediaSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
