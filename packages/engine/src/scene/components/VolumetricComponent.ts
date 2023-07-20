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

import VolumetricPlayer from '@citizendot/universal-volumetric/dist/Player'
import { useEffect } from 'react'

import { createWorkerFromCrossOriginURL } from '@etherealengine/common/src/utils/createWorkerFromCrossOriginURL'
import { getState } from '@etherealengine/hyperflux'

import { AudioState } from '../../audio/AudioState'
import {
  ComponentType,
  defineComponent,
  getMutableComponent,
  getOptionalComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../components/GroupComponent'
import { PlayMode } from '../constants/PlayMode'
import { AudioNodeGroups, MediaElementComponent, createAudioNodeGroup } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'

export const VolumetricComponent = defineComponent({
  name: 'EE_volumetric',
  jsonID: 'volumetric',

  onInit: (entity) => {
    return {
      useLoadingEffect: false,
      hasSetTrack: false,
      player: undefined! as VolumetricPlayer,
      paths: [] as string[],
      paused: true,
      volume: 1,
      playMode: PlayMode.loop as PlayMode,
      track: 0
    }
  },

  toJSON: (entity, component) => {
    return {
      useLoadingEffect: component.useLoadingEffect.value,
      paths: component.paths.value,
      paused: component.paused.value,
      volume: component.volume.value,
      playMode: component.playMode.value
    }
  },

  onSet: (entity, component, json) => {
    // setComponent(entity, MediaElementComponent, {
    //   element: document.createElement('video')
    // })
    // setComponent(entity, PositionalAudioComponent)
    setComponent(entity, ShadowComponent)

    if (!json) return
    if (typeof json?.useLoadingEffect === 'boolean' && json.useLoadingEffect !== component.useLoadingEffect.value)
      component.useLoadingEffect.set(json.useLoadingEffect)

    if (typeof json.paths === 'object') {
      component.paths.set(json.paths)
    }

    if (typeof json.paused === 'boolean') component.paused.set(json.paused)

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
    const worker = createWorkerFromCrossOriginURL(VolumetricPlayer.defaultWorkerURL)
    setComponent(entity, MediaElementComponent, {
      element: document.createElement('video') as HTMLMediaElement
    })
    const mediaElement = getMutableComponent(entity, MediaElementComponent)
    const element = mediaElement.element.value
    element.autoplay = true
    // element.muted = true
    element.crossOrigin = 'anonymous'

    console.log('[CustomDebug] Volumetric MediaElement: ', element)

    volumetric.player.set(
      new VolumetricPlayer({
        renderer: EngineRenderer.instance.renderer,
        onTrackEnd: () => {
          volumetric.track.set(getNextTrack(volumetric.value))
        },
        video: element as HTMLVideoElement,
        V1Args: {
          worker: worker
        },
        paths: [],
        playMode: PlayMode.loop
      })
    )
    addObjectToGroup(entity, volumetric.player.value.mesh)

    if (!AudioNodeGroups.get(element)) {
      const audioNodes = createAudioNodeGroup(
        element,
        audioContext.createMediaElementSource(element),
        gainNodeMixBuses.soundEffects
      )
      console.log(
        '[CustomDebug] Setting AudioNode for Volumetric Media Element (source created from createMediaElementSource): ',
        {
          mediaElement: element,
          audioNode: audioNodes
        }
      )

      audioNodes.gain.gain.setTargetAtTime(volumetric.volume.value, audioContext.currentTime, 0.1)
    }
  }, [])

  useEffect(
    function updateVolume() {
      const volume = volumetric.volume.value
      const element = getOptionalComponent(entity, MediaElementComponent)?.element as HTMLMediaElement
      if (!element) return
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
      }
    },
    [volumetric.volume]
  )

  useEffect(() => {
    if (!volumetric.hasSetTrack.value && volumetric.paths[volumetric.track.value].value) {
      console.log('[CustomDebug] Setting the first track: ', {
        track: volumetric.track.value,
        manifestPath: volumetric.paths[volumetric.track.value].value
      })
      volumetric.player.value.setTrackPath(volumetric.paths[volumetric.track.value].value)
      volumetric.hasSetTrack.set(true)
      return
    }

    if (volumetric.player.value.stopped) {
      // Track is changed. Set the track path
      if (volumetric.paths[volumetric.track.value].value) {
        console.log('[CustomDebug] Updating VolumetricTrack: ', {
          track: volumetric.track.value,
          manifestPath: volumetric.paths[volumetric.track.value].value
        })
        volumetric.player.value.setTrackPath(volumetric.paths[volumetric.track.value].value)
      }
    } else {
      /** Track isn't changed. Probably new path is added or edited.
       * No need to set track path.
       */
    }
  }, [volumetric.track, volumetric.paths])

  useEffect(() => {
    console.log('[CustomDebug] volumetric.paused changed: ', volumetric.paused.value)
    if (volumetric.paused.value) {
      volumetric.player.value.pause()
    } else {
      volumetric.player.value.play()
    }
  }, [volumetric.paused])

  return null
}

export function getNextTrack(volumetric: ComponentType<typeof VolumetricComponent>) {
  const currentTrack = volumetric.track
  const numTracks = volumetric.paths.length
  let nextTrack = 0

  if (volumetric.playMode == PlayMode.random) {
    // todo: smart random, i.e., lower probability of recently played tracks
    nextTrack = Math.floor(Math.random() * numTracks)
  } else if (volumetric.playMode == PlayMode.single) {
    nextTrack = (currentTrack + 1) % numTracks
  } else if (volumetric.playMode == PlayMode.singleloop) {
    nextTrack = currentTrack
  } else {
    //PlayMode.Loop
    nextTrack = (currentTrack + 1) % numTracks
  }
  console.log('[CustomDebug] new track: ', nextTrack)

  return nextTrack
}

export const VolumetricsExtensions = ['drcs', 'uvol', 'manifest']
