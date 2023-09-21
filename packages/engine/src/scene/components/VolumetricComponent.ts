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

import { getState } from '@etherealengine/hyperflux'
import { AudioState } from '../../audio/AudioState'
import {
  defineComponent,
  getMutableComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { PlayMode } from '../constants/PlayMode'
import { AudioNodeGroups, MediaElementComponent, createAudioNodeGroup } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'
import { UVOL1Component } from './UVOL1Component'

export const VolumetricComponent = defineComponent({
  name: 'EE_volumetric',
  jsonID: 'volumetric',

  onInit: (entity) => {
    setComponent(entity, MediaElementComponent, {
      element: document.createElement('video') as HTMLMediaElement
    })
    setComponent(entity, ShadowComponent)
    return {
      paths: [] as string[],
      paused: false,
      ended: true,
      volume: 1,
      playMode: PlayMode.loop as PlayMode,
      track: 0
    }
  },

  toJSON: (entity, component) => {
    return {
      paths: component.paths.value,
      paused: component.paused.value,
      ended: component.ended.value,
      volume: component.volume.value,
      playMode: component.playMode.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.paths === 'object') {
      component.paths.set(json.paths)
    }

    if (typeof json.paused === 'boolean') {
      component.paused.set(json.paused)
    }

    if (typeof json.ended === 'boolean') {
      component.ended.set(json.ended)
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
  const videoElement = getMutableComponent(entity, MediaElementComponent)

  useEffect(() => {
    const element = videoElement.element.value as HTMLVideoElement
    element.playsInline = true
    element.autoplay = true
    element.preload = 'auto'
    element.crossOrigin = 'anonymous'

    if (!AudioNodeGroups.get(element)) {
      const source = audioContext.createMediaElementSource(element)
      const audioNodes = createAudioNodeGroup(element, source, gainNodeMixBuses.soundEffects)

      audioNodes.gain.gain.setTargetAtTime(volumetric.volume.value, audioContext.currentTime, 0.1)
    }

    element.addEventListener('ended', () => {
      volumetric.ended.set(true)
    })

    // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
    // in order to ensure media will play programmatically
    const handleAutoplay = () => {
      // programatically started playback
      if (!volumetric.paused.value) {
        element.play()
        audioContext.resume()
        window.removeEventListener('pointerdown', handleAutoplay)
        window.removeEventListener('keypress', handleAutoplay)
        window.removeEventListener('touchstart', handleAutoplay)
        EngineRenderer.instance.renderer.domElement.removeEventListener('pointerdown', handleAutoplay)
        EngineRenderer.instance.renderer.domElement.removeEventListener('touchstart', handleAutoplay)
      }
    }
    window.addEventListener('pointerdown', handleAutoplay)
    window.addEventListener('keypress', handleAutoplay)
    window.addEventListener('touchstart', handleAutoplay)
    EngineRenderer.instance.renderer.domElement.addEventListener('pointerdown', handleAutoplay)
    EngineRenderer.instance.renderer.domElement.addEventListener('touchstart', handleAutoplay)
  }, [])

  useEffect(() => {
    const pathCount = volumetric.paths.value.length
    if (!volumetric.ended.value || pathCount === 0) return

    /**
     * Find the next valid track: If the current track is invalid, try the next one.
     * Here invalid means, path does not end with '.manifest'.
     */
    let currentTrack = volumetric.track.value
    // eslint-disable-next-line
    while (true) {
      const nextTrack = getNextTrack(volumetric.playMode.value, pathCount, currentTrack)
      const manifestPath = volumetric.paths.value[nextTrack]
      if (manifestPath && (manifestPath.endsWith('.manifest') || manifestPath.endsWith('.mp4'))) {
        currentTrack = nextTrack
        break
      } else if (nextTrack == volumetric.track.value) {
        // No valid tracks found, stop playing
        currentTrack = -1
        break
      } else {
        // 'nextTrack' is not a valid track, try the next one
        currentTrack = nextTrack
      }
    }

    if (currentTrack === -1) {
      console.info('VDEBUG: No valid tracks found.')
      return
    }

    // UVOL1/UVOL2 sets paused to true, when initial buffers are loaded
    volumetric.paused.set(true)

    // Starting a new track, reset ended
    volumetric.ended.set(false)

    // Removing component triggers cleanup.
    // Overwriting with setComponent doesn't trigger cleanup.
    removeComponent(entity, UVOL1Component)

    volumetric.track.set(currentTrack)

    let manifestPath = volumetric.paths.value[currentTrack]
    if (manifestPath.endsWith('.mp4')) {
      // UVOL1
      manifestPath = manifestPath.replace('.mp4', '.manifest')
    }

    fetch(manifestPath)
      .then((response) => response.json())
      .then((json) => {
        setComponent(entity, UVOL1Component)
        const player = getMutableComponent(entity, UVOL1Component)
        player.track.set({
          manifestPath: manifestPath,
          data: json
        })
      })
  }, [volumetric.paths, volumetric.playMode, volumetric.ended])

  useEffect(() => {
    const volume = volumetric.volume.value
    const element = videoElement.element.value
    const audioNodes = AudioNodeGroups.get(element)
    if (audioNodes) {
      audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
    }
  }, [volumetric.volume])

  return null
}

export function getNextTrack(playMode: PlayMode, pathCount: number, currentTrack: number) {
  let nextTrack = 0

  if (playMode == PlayMode.random) {
    // TODO: Smart random: Lower probability of recently played tracks
    nextTrack = Math.floor(Math.random() * pathCount)
  } else if (playMode == PlayMode.single) {
    nextTrack = (currentTrack + 1) % pathCount
  } else if (playMode == PlayMode.singleloop) {
    nextTrack = currentTrack
  } else {
    // Default: PlayMode.Loop
    nextTrack = (currentTrack + 1) % pathCount
  }

  return nextTrack
}
