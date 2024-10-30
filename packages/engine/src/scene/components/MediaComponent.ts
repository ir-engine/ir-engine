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

import type Hls from 'hls.js'
import { useEffect, useLayoutEffect } from 'react'
import { DoubleSide, MeshBasicMaterial, PlaneGeometry } from 'three'

import { ComponentType } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { entityExists, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { State, getState, isClient, useMutableState } from '@ir-engine/hyperflux'
import { DebugMeshComponent } from '@ir-engine/spatial/src/common/debug/DebugMeshComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { StandardCallbacks, removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { AudioState } from '../../audio/AudioState'
import { removePannerNode } from '../../audio/PositionalAudioFunctions'
import { PlayMode } from '../constants/PlayMode'
import { addError, clearErrors, removeError } from '../functions/ErrorFunctions'
import isHLS from '../functions/isHLS'

const AUDIO_TEXTURE_PATH = '/static/editor/audio-icon.png'

export const AudioNodeGroups = new WeakMap<HTMLMediaElement | MediaStream, AudioNodeGroup>()

export type AudioNodeGroup = {
  source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode
  gain: GainNode
  panner?: PannerNode
  mixbus: GainNode
}

export const createAudioNodeGroup = (
  el: HTMLMediaElement | MediaStream,
  source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode,
  mixbus: GainNode
) => {
  const audioContext = getState(AudioState).audioContext
  const gain = audioContext.createGain()
  source.connect(gain)
  gain.connect(mixbus)
  const panner = audioContext.createPanner()
  const group = { source, gain, mixbus, panner } as AudioNodeGroup
  AudioNodeGroups.set(el, group)
  return group
}

export const MediaElementComponent = defineComponent({
  name: 'MediaElement',

  schema: S.Object({
    element: S.Type<HTMLMediaElement>(),
    hls: S.Optional(S.Type<Hls>()),
    abortController: S.Class(() => new AbortController())
  }),

  toJSON: () => {
    return null! as { element: HTMLMediaElement }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.element === 'object' && json.element !== component.element.get({ noproxy: true }))
      component.element.set(json.element as HTMLMediaElement)
  },

  reactor: () => {
    const entity = useEntityContext()
    const mediaElementComponent = useComponent(entity, MediaElementComponent)

    useLayoutEffect(() => {
      const media = mediaElementComponent.get({ noproxy: true })
      return () => {
        if (!entityExists(entity) || !hasComponent(entity, MediaElementComponent)) {
          const element = media.element as HTMLMediaElement
          media.hls?.destroy()
          const audioNodeGroup = AudioNodeGroups.get(element)
          if (audioNodeGroup && audioNodeGroup.panner) removePannerNode(audioNodeGroup)
          AudioNodeGroups.delete(element)
          element.pause()
          element.removeAttribute('src')
          element.load()
          element.remove()
          media.abortController.abort()
        }
      }
    }, [mediaElementComponent])
  },

  errors: ['MEDIA_ERROR', 'HLS_ERROR']
})

export const MediaComponent = defineComponent({
  name: 'MediaComponent',
  jsonID: 'EE_media',

  schema: S.Object({
    controls: S.Bool(false),
    synchronize: S.Bool(true),
    autoplay: S.Bool(false), //false = personal preference, this is super annoying when it just starts playing once added to a scene while editing
    uiOffset: S.Vec3(),
    xruiEntity: S.Entity(),
    volume: S.Number(1),
    resources: S.Array(S.String()),
    playMode: S.Enum(PlayMode, PlayMode.loop),
    isMusic: S.Bool(false),
    seekTime: S.Number(0),
    /**@deprecated */
    paths: S.Array(S.String()),
    // runtime props
    paused: S.Bool(true),
    ended: S.Bool(true),
    waiting: S.Bool(false),
    track: S.Number(-1),
    trackDurations: S.Array(S.Number())
    /**
     * TODO: refactor this into a ScheduleComponent for invoking callbacks at scheduled times
     * The auto start time for the playlist, in Unix/Epoch time (milliseconds).
     * If this value is negative, media playback must be explicitly started.
     * If this value is non-negative and in the past, playback as soon as possible.
     * If this value is in the future, begin playback at the appointed time.
     */
    // autoStartTime: -1
  }),

  toJSON: (component) => {
    return {
      controls: component.controls,
      autoplay: component.autoplay,
      resources: [...component.resources].filter(Boolean), // filter empty strings
      volume: component.volume,
      uiOffset: component.uiOffset,
      synchronize: component.synchronize,
      playMode: component.playMode,
      isMusic: component.isMusic,
      seekTime: component.seekTime // we can start media from a specific point if needed
    }
  },

  reactor: MediaReactor,

  errors: ['LOADING_ERROR', 'UNSUPPORTED_ASSET_CLASS', 'INVALID_URL']
})

export function MediaReactor() {
  const entity = useEntityContext()
  const media = useComponent(entity, MediaComponent)
  const mediaElement = useOptionalComponent(entity, MediaElementComponent)
  const audioContext = getState(AudioState).audioContext
  const gainNodeMixBuses = getState(AudioState).gainNodeMixBuses
  const rendererEntity = useRendererEntity(entity)

  if (!isClient) return null

  useEffect(() => {
    if (!rendererEntity) return
    setComponent(entity, BoundingBoxComponent)
    setComponent(entity, InputComponent, { highlight: false, grow: false })
    const renderer = getComponent(rendererEntity, RendererComponent).renderer!
    // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
    // in order to ensure media will play programmatically
    const handleAutoplay = () => {
      const mediaComponent = getComponent(entity, MediaElementComponent)
      // handle when we dont have autoplay enabled but have programatically started playback
      if (!media.autoplay.value && !media.paused.value) mediaComponent?.element.play()
      // handle when we have autoplay enabled but have paused playback
      if (media.autoplay.value && media.paused.value) media.paused.set(false)
      // handle when we have autoplay and mediaComponent is paused
      if (media.autoplay.value && !media.paused.value && mediaComponent?.element.paused) mediaComponent.element.play()
      window.removeEventListener('pointerup', handleAutoplay)
      window.removeEventListener('keypress', handleAutoplay)
      window.removeEventListener('touchend', handleAutoplay)
      document.body.removeEventListener('pointerup', handleAutoplay)
      document.body.removeEventListener('touchend', handleAutoplay)
      renderer.domElement.removeEventListener('pointerup', handleAutoplay)
      renderer.domElement.removeEventListener('touchend', handleAutoplay)
    }
    window.addEventListener('pointerup', handleAutoplay)
    window.addEventListener('keypress', handleAutoplay)
    window.addEventListener('touchend', handleAutoplay)
    document.body.addEventListener('pointerup', handleAutoplay)
    document.body.addEventListener('touchend', handleAutoplay)
    renderer.domElement.addEventListener('pointerup', handleAutoplay)
    renderer.domElement.addEventListener('touchend', handleAutoplay)

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

    return () => {
      window.removeEventListener('pointerup', handleAutoplay)
      window.removeEventListener('keypress', handleAutoplay)
      window.removeEventListener('touchend', handleAutoplay)
      document.body.removeEventListener('pointerup', handleAutoplay)
      document.body.removeEventListener('touchend', handleAutoplay)
      renderer.domElement.removeEventListener('pointerup', handleAutoplay)
      renderer.domElement.removeEventListener('touchend', handleAutoplay)

      removeComponent(entity, BoundingBoxComponent)
      removeComponent(entity, InputComponent)
      removeComponent(entity, MediaElementComponent)

      removeCallback(entity, StandardCallbacks.PLAY)
      removeCallback(entity, StandardCallbacks.PAUSE)
      removeCallback(entity, StandardCallbacks.RESET)
    }
  }, [rendererEntity])

  useEffect(
    function updatePlay() {
      if (!mediaElement) return
      if (media.paused.value) {
        mediaElement.element.value.pause()
      } else {
        const promise = mediaElement.element.value.play()
        if (promise) {
          promise.catch((error) => {
            console.error(error)
          })
        }
      }
    },
    [media.paused, mediaElement]
  )

  useEffect(() => {
    if (mediaElement && !mediaElement.element.paused.value) {
      mediaElement.element.value.play() // if not paused, start play again
    }
  }, [mediaElement])

  useEffect(
    function updateTrackMetadata() {
      clearErrors(entity, MediaComponent)

      const paths = media.resources.value

      // If no paths or currently play path has been removed stop the track from playing
      // and signal to move to next track if one exists
      if (hasComponent(entity, MediaElementComponent)) {
        const mediaElement = getComponent(entity, MediaElementComponent).element
        if (paths.length === 0 || !paths.includes(mediaElement.src)) {
          mediaElement.pause()
          removeComponent(entity, MediaElementComponent)
          media.ended.set(true)
        }
      }

      for (const path of paths) {
        const assetClass = AssetLoader.getAssetClass(path).toLowerCase()
        if (path !== '' && assetClass !== 'audio' && assetClass !== 'video') {
          return addError(entity, MediaComponent, 'UNSUPPORTED_ASSET_CLASS')
        }
      }

      const metadataListeners = [] as Array<{ tempElement: HTMLMediaElement; listener: () => void }>

      for (const [i, path] of paths.entries()) {
        if (path === '') continue
        const assetClass = AssetLoader.getAssetClass(path).toLowerCase()
        const tempElement = document.createElement(assetClass) as HTMLMediaElement
        const listener = () => media.trackDurations[i].set(tempElement.duration)
        metadataListeners.push({ tempElement, listener })
        tempElement.addEventListener('loadedmetadata', listener)
        tempElement.crossOrigin = 'anonymous'
        tempElement.preload = 'metadata'
        tempElement.src = path
      }

      return () => {
        for (const { tempElement, listener } of metadataListeners) {
          tempElement.removeEventListener('loadedmetadata', listener)
          tempElement.src = ''
          tempElement.load()
        }
      }
    },
    [media.resources]
  )

  useEffect(
    function updateMediaElement() {
      if (!media.ended.value) return // If current track is not ended, don't change the track

      if (!isClient) return

      if (media.resources.value.every((resource) => !resource)) return // if all resources are empty, we dont move to next track

      const mediaElement = getOptionalComponent(entity, MediaElementComponent)
      const track = media.track.value
      let nextTrack = getNextTrack(track, media.resources.length, media.playMode.value)

      //check if we haven't set up for single play yet, or if our sources don't match the new resources
      //** todo  make this more robust in a refactor, feels very error prone with edge cases */
      if (nextTrack === -1) return

      let path = media.resources.value[nextTrack]

      while (!path) {
        // we already remove the case where we dont have any track
        // if current path is null, we simply skip over and move to next proper track
        nextTrack = (nextTrack + 1) % media.resources.length
        path = media.resources[nextTrack].value
      }

      const assetClass = AssetLoader.getAssetClass(path).toLowerCase()

      if (assetClass !== 'audio' && assetClass !== 'video') {
        addError(entity, MediaComponent, 'UNSUPPORTED_ASSET_CLASS')
        return
      }

      media.ended.set(false)
      media.track.set(nextTrack)

      if (!mediaElement || mediaElement.element.nodeName.toLowerCase() !== assetClass) {
        setUpMediaElement(entity, path, media, audioContext, gainNodeMixBuses)
      }

      setComponent(entity, MediaElementComponent)
      const mediaElementState = getMutableComponent(entity, MediaElementComponent)

      mediaElementState.hls.value?.destroy()
      mediaElementState.hls.set(undefined)
      ;(mediaElementState.element.value as HTMLMediaElement).crossOrigin = 'anonymous'
      if (isHLS(path)) {
        setupHLS(entity, path).then((hls) => {
          mediaElementState.hls.set(hls)
          mediaElementState.hls.value!.attachMedia(mediaElementState.element.value as HTMLMediaElement)
        })
      } else {
        mediaElementState.element.src.set(path)
      }

      if (!media.paused.value) {
        mediaElementState.value.element.play()
      }
    },
    [media.resources, media.ended, media.playMode]
  )

  useEffect(
    function updateVolume() {
      const volume = media.volume.value
      const element = getOptionalComponent(entity, MediaElementComponent)?.element as HTMLMediaElement
      if (!element) return
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
      }
    },
    [media.volume]
  )

  useEffect(
    function updateMixbus() {
      if (mediaElement == null) {
        return
      }
      if (mediaElement.promised || mediaElement.value == null) {
        return
      }

      const element = mediaElement.element.get({ noproxy: true }) as HTMLMediaElement
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.disconnect(audioNodes.mixbus)
        audioNodes.mixbus = media.isMusic.value ? gainNodeMixBuses.music : gainNodeMixBuses.soundEffects
        audioNodes.gain.connect(audioNodes.mixbus)
      }
    },
    [mediaElement, media.isMusic]
  )

  const rendererState = useMutableState(RendererState)
  const [audioHelperTexture] = useTexture(rendererState.nodeHelperVisibility.value ? AUDIO_TEXTURE_PATH : '', entity)

  useEffect(() => {
    if (rendererState.nodeHelperVisibility.value && audioHelperTexture) {
      const material = new MeshBasicMaterial({ transparent: true, side: DoubleSide })
      material.map = audioHelperTexture
      setComponent(entity, DebugMeshComponent, {
        name: 'audio-helper',
        geometry: new PlaneGeometry(),
        material: material
      })
    }

    return () => {
      removeComponent(entity, DebugMeshComponent)
    }
  }, [rendererState.nodeHelperVisibility, audioHelperTexture])

  return null
}

const setUpMediaElement = (
  entity: Entity,
  path: string,
  media: State<ComponentType<typeof MediaComponent>>,
  audioContext: AudioContext,
  gainNodeMixBuses: {
    mediaStreams: GainNode
    notifications: GainNode
    music: GainNode
    soundEffects: GainNode
  }
) => {
  const assetClass = AssetLoader.getAssetClass(path).toLowerCase()
  setComponent(entity, MediaElementComponent, {
    element: document.createElement(assetClass) as HTMLMediaElement
  })
  const mediaElementState = getMutableComponent(entity, MediaElementComponent)

  const element = mediaElementState.element.value as HTMLMediaElement

  element.crossOrigin = 'anonymous'
  element.preload = 'auto'
  element.muted = false
  element.setAttribute('playsinline', 'true')

  const signal = mediaElementState.abortController.signal.value

  element.addEventListener(
    'playing',
    () => {
      media.waiting.set(false)
      clearErrors(entity, MediaElementComponent)
    },
    { signal }
  )
  element.addEventListener('waiting', () => media.waiting.set(true), { signal })
  element.addEventListener(
    'error',
    (err) => {
      addError(entity, MediaElementComponent, 'MEDIA_ERROR', err.message)
      media.ended.set(true)
      media.waiting.set(false)
    },
    { signal }
  )

  element.addEventListener(
    'ended',
    () => {
      media.ended.set(true)
      media.waiting.set(false)
    },
    { signal }
  )

  const audioNodes = createAudioNodeGroup(
    element,
    audioContext.createMediaElementSource(element),
    media.isMusic.value ? gainNodeMixBuses.music : gainNodeMixBuses.soundEffects
  )

  audioNodes.gain.gain.setTargetAtTime(media.volume.value, audioContext.currentTime, 0.1)
}

export const setupHLS = async (entity: Entity, url: string): Promise<Hls> => {
  const Hls = await import('hls.js')
  const hls = new Hls.default()
  hls.on(Hls.Events.ERROR, function (event, data) {
    if (data.fatal) {
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          // try to recover network error
          console.error('fatal network error encountered, try to recover', event, data)
          hls.startLoad()
          break
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.error('fatal media error encountered, try to recover', event, data)
          hls.recoverMediaError()
          break
        default:
          // cannot recover
          console.error('HLS fatal error encountered, destroying video...', event, data)
          hls.destroy()
          break
      }
      addError(entity, MediaElementComponent, 'HLS_ERROR')
    }
  })

  // hls.once(Hls.Events.LEVEL_LOADED, () => { resolve() })
  hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    hls.loadSource(url)
    hls.on(Hls.Events.MANIFEST_PARSED, (_event, _data) => {
      removeError(entity, MediaElementComponent, 'HLS_ERROR')
    })
  })

  return hls
}

export function setTime(element: State<HTMLMediaElement>, time: number) {
  if (!element.value || time < 0 || element.value.currentTime === time) return
  element.currentTime.set(time)
}

export function getNextTrack(currentTrack: number, trackCount: number, currentMode: PlayMode) {
  if (trackCount === 0) return -1

  let nextTrack = 0
  if (currentMode == PlayMode.single) {
    nextTrack = currentTrack + 1
    if (nextTrack >= trackCount) {
      return -1
    }
  } else if (currentMode == PlayMode.random) {
    // todo: smart random, i.e., lower probability of recently played tracks
    nextTrack = Math.floor(Math.random() * trackCount)
  } else if (currentMode == PlayMode.singleloop) {
    nextTrack = currentTrack
  } else {
    //PlayMode.Loop
    nextTrack = (currentTrack + 1) % trackCount
  }

  return nextTrack
}
