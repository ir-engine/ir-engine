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

import {
  ComponentType,
  defineComponent,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { State, getState } from '@etherealengine/hyperflux'
import { EngineRenderer } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { AudioState } from '../../audio/AudioState'
import { PlayMode } from '../constants/PlayMode'
import { AudioNodeGroups, MediaElementComponent, createAudioNodeGroup, getNextTrack } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'
import { UVOL1Component } from './UVOL1Component'
import { UVOL2Component } from './UVOL2Component'

export function handleAutoplay(
  audioContext: AudioContext,
  media: HTMLMediaElement,
  volumetric: State<ComponentType<typeof VolumetricComponent>>
) {
  const attachEventListeners = () => {
    const playMedia = () => {
      media.play()
      audioContext.resume()
      volumetric.paused.set(false)
      window.removeEventListener('pointerdown', playMedia)
      window.removeEventListener('keypress', playMedia)
      window.removeEventListener('touchstart', playMedia)
      EngineRenderer.instance.renderer.domElement.removeEventListener('pointerdown', playMedia)
      EngineRenderer.instance.renderer.domElement.removeEventListener('touchstart', playMedia)
    }
    window.addEventListener('pointerdown', playMedia)
    window.addEventListener('keypress', playMedia)
    window.addEventListener('touchstart', playMedia)
    EngineRenderer.instance.renderer.domElement.addEventListener('pointerdown', playMedia)
    EngineRenderer.instance.renderer.domElement.addEventListener('touchstart', playMedia)
  }

  // Try to play. If it fails, attach event listeners to play on user interaction
  media
    .play()
    .catch((e) => {
      if (e.name === 'NotAllowedError') {
        attachEventListeners()
      }
    })
    .then(() => {
      volumetric.paused.set(false)
    })
}

export const VolumetricComponent = defineComponent({
  name: 'Volumetric Component',
  jsonID: 'volumetric',
  onInit: (entity) => {
    return {
      paths: [] as string[],
      useLoadingEffect: true,
      autoPauseWhenBuffering: true, // TODO: Implement this for UVOL1
      autoplay: true,
      paused: true,
      initialBuffersLoaded: false,
      hasAudio: false,
      ended: true,
      volume: 1,
      playMode: PlayMode.loop as PlayMode,
      track: -1,
      forceChangeTrack: false,
      currentTrackInfo: {
        dontReset: false,
        mediaStartTime: 0,
        playbackStartDate: 0,
        playbackRate: 1,
        currentTime: 0,
        duration: 0
      }
    }
  },

  toJSON: (entity, component) => {
    return {
      paths: component.paths.value,
      useLoadingEffect: component.useLoadingEffect.value,
      autoplay: component.autoplay.value,
      volume: component.volume.value,
      playMode: component.playMode.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.paths === 'object') {
      component.paths.set(json.paths)
    }

    if (typeof json.useLoadingEffect === 'boolean') {
      component.useLoadingEffect.set(json.useLoadingEffect)
    }

    if (typeof json.autoplay === 'boolean') {
      component.autoplay.set(json.autoplay)
    }

    if (typeof json.volume === 'number') {
      component.volume.set(json.volume)
    }

    // backwars-compat: convert from number enums to strings
    if (
      (typeof json.playMode === 'number' || typeof json.playMode === 'string') &&
      json.playMode !== component.playMode.value
    ) {
      if (typeof json.playMode === 'number') {
        switch (json.playMode) {
          case 1:
            component.playMode.set(PlayMode.single)
            break
          case 2:
            component.playMode.set(PlayMode.random)
            break
          case 3:
            component.playMode.set(PlayMode.loop)
            break
          case 4:
            component.playMode.set(PlayMode.singleloop)
            break
        }
      } else {
        component.playMode.set(json.playMode)
      }
    }
  },

  reactor: VolumetricReactor
})

export function VolumetricReactor() {
  const entity = useEntityContext()
  const audioContext = getState(AudioState).audioContext
  const gainNodeMixBuses = getState(AudioState).gainNodeMixBuses
  const volumetric = useComponent(entity, VolumetricComponent)

  useEffect(() => {
    setComponent(entity, MediaElementComponent, {
      element: document.createElement('video') as HTMLMediaElement
    })
    setComponent(entity, ShadowComponent)
    const videoElement = getMutableComponent(entity, MediaElementComponent)
    const element = videoElement.element.value as HTMLVideoElement
    element.playsInline = true
    element.preload = 'auto'
    element.crossOrigin = 'anonymous'

    if (!AudioNodeGroups.get(element)) {
      const source = audioContext.createMediaElementSource(element)
      const audioNodes = createAudioNodeGroup(element, source, gainNodeMixBuses.soundEffects)

      audioNodes.gain.gain.setTargetAtTime(volumetric.volume.value, audioContext.currentTime, 0.1)
    }

    return () => {
      removeComponent(entity, UVOL1Component)
      removeComponent(entity, UVOL2Component)
    }
  }, [])

  useEffect(() => {
    if (!volumetric.ended.value) {
      // If current track is not ended, don't change the track
      return
    }

    const pathCount = volumetric.paths.value.length

    let nextTrack = getNextTrack(volumetric.track.value, pathCount, volumetric.playMode.value)
    const ACCEPTED_TYPES = ['manifest', 'drcs', 'mp4', 'json']

    for (let i = 0; i <= pathCount; i++) {
      const path = volumetric.paths.value[nextTrack]
      const extension = path ? path.split('.').pop()?.split('?').shift() : ''
      if (path && extension && ACCEPTED_TYPES.includes(extension)) {
        break
      } else {
        if (nextTrack === volumetric.track.value) {
          // If we've looped through all the tracks and none are valid, return
          return
        }
        nextTrack = getNextTrack(nextTrack, pathCount, volumetric.playMode.value)
        if (nextTrack === -1) return
      }
    }
    if (nextTrack === -1 || !volumetric.paths.value[nextTrack]) return

    if (!volumetric.currentTrackInfo.dontReset.value) {
      resetTrack()
    }
    volumetric.track.set(nextTrack)
    volumetric.forceChangeTrack.set(!volumetric.forceChangeTrack.value)
  }, [volumetric.paths, volumetric.playMode, volumetric.ended])

  const resetTrack = () => {
    // Overwriting with setComponent doesn't cleanup the component
    removeComponent(entity, UVOL1Component)
    removeComponent(entity, UVOL2Component)
    volumetric.initialBuffersLoaded.set(false)
    volumetric.paused.set(true)
    volumetric.currentTrackInfo.set({
      dontReset: false,
      mediaStartTime: 0,
      playbackStartDate: 0,
      playbackRate: 1,
      currentTime: 0,
      duration: 0
    })
  }

  useEffect(() => {
    if (volumetric.track.value === -1) return
    volumetric.ended.set(false)
    let manifestPath = volumetric.paths.value[volumetric.track.value]
    if (manifestPath.endsWith('.mp4')) {
      // UVOL1
      manifestPath = manifestPath.replace('.mp4', '.manifest')
    } else if (manifestPath.endsWith('.drcs')) {
      // UVOL2
      manifestPath = manifestPath.replace('.drcs', '.manifest')
    }

    fetch(manifestPath)
      .then((response) => response.json())
      .then((json) => {
        if ('type' in json) {
          setComponent(entity, UVOL2Component, {
            manifestPath: manifestPath,
            data: json
          })
        } else {
          setComponent(entity, UVOL1Component, {
            manifestPath: manifestPath,
            data: json
          })
        }
      })
  }, [volumetric.track, volumetric.forceChangeTrack])

  useEffect(() => {
    const volume = volumetric.volume.value
    const element = getComponent(entity, MediaElementComponent).element as HTMLVideoElement
    const audioNodes = AudioNodeGroups.get(element)
    if (audioNodes) {
      audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
    }
  }, [volumetric.volume])

  return null
}
