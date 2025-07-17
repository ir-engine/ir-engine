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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { ComponentType, EngineState, entityExists, useEntityContext } from '@ir-engine/ecs'
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
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState, isClient, useMutableState } from '@ir-engine/hyperflux'
import { StandardCallbacks, removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import type Hls from 'hls.js'
import { useEffect, useLayoutEffect } from 'react'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AudioState } from '../../audio/AudioState'
import { removePannerNode } from '../../audio/PositionalAudioFunctions'
import { PlayMode } from '../constants/PlayMode'
import { addError, clearErrors, removeError } from '../functions/ErrorFunctions'
import isHLS from '../functions/isHLS'

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
    hls: S.Type<Hls | undefined>(),
    abortController: S.Class(() => new AbortController())
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.element === 'object' && json.element !== component.element) component.element = json.element
  },

  onRemove: (entity, component) => {
    if (component.element) {
      component.element.remove()
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const mediaElement = useComponent(entity, MediaElementComponent)

    useLayoutEffect(() => {
      return () => {
        if (!entityExists(entity) || !hasComponent(entity, MediaElementComponent)) {
          const element = mediaElement.element as HTMLMediaElement
          mediaElement.hls?.destroy()
          const audioNodeGroup = AudioNodeGroups.get(element)
          if (audioNodeGroup && audioNodeGroup.panner) removePannerNode(audioNodeGroup)
          AudioNodeGroups.delete(element)
          element.pause()
          element.removeAttribute('src')
          element.load()
          element.remove()
          mediaElement.abortController.abort()
        }
      }
    }, [mediaElement])
  },

  errors: ['MEDIA_ERROR', 'HLS_ERROR']
})

export const MediaComponent = defineComponent({
  name: 'MediaComponent',
  jsonID: 'EE_media',

  schema: S.Object({
    controls: S.Bool({ default: false }),
    synchronize: S.Bool({ default: true }),
    autoplay: S.Bool({ default: false }), //false = personal preference, this is super annoying when it just starts playing once added to a scene while editing
    muteEditor: S.Bool({ default: false }), //false
    uiOffset: T.Vec3(),
    volume: S.Number({ default: 1 }),
    resources: S.Array(S.String()),
    playMode: S.Enum(PlayMode, {
      $comment: "A string enum, ie. one of the following values: 'single', 'random', 'loop', 'singleloop'",
      default: PlayMode.loop
    }),
    isMusic: S.Bool({ default: false }),
    seekTime: S.Number({ default: 0, serialized: false }),
    /**@deprecated */
    paths: S.Array(S.String()),
    // runtime props
    xruiEntity: S.Entity({ serialized: false }),
    paused: S.Bool({ default: true, serialized: false }),
    muted: S.Bool({ default: false, serialized: false }),
    ended: S.Bool({ default: true, serialized: false }),
    waiting: S.Bool({ default: false, serialized: false }),
    track: S.Number({ default: -1, serialized: false }),
    currentTrackTime: S.Number({ default: 0, serialized: false }),
    currentTrackDuration: S.Number({ default: 0, serialized: false }),
    isCurrentTrackLoaded: S.Bool({ default: false, serialized: false }),
    externalMediaNodeID: S.EntityID()
    /**
     * TODO: refactor this into a ScheduleComponent for invoking callbacks at scheduled times
     * The auto start time for the playlist, in Unix/Epoch time (milliseconds).
     * If this value is negative, media playback must be explicitly started.
     * If this value is non-negative and in the past, playback as soon as possible.
     * If this value is in the future, begin playback at the appointed time.
     */
    // autoStartTime: -1
  }),

  reactor: MediaReactor,

  errors: ['LOADING_ERROR', 'UNSUPPORTED_ASSET_CLASS', 'INVALID_URL']
})

export function MediaReactor() {
  if (!isClient) return null

  const entity = useEntityContext()
  const media = useComponent(entity, MediaComponent)
  const mediaElement = useOptionalComponent(entity, MediaElementComponent)
  const audioContext = getState(AudioState).audioContext
  const gainNodeMixBuses = getState(AudioState).gainNodeMixBuses
  const rendererEntity = useRendererEntity(entity)
  const engineState = useMutableState(EngineState)

  function validateTime() {
    if (!mediaElement) return

    const element = mediaElement.element
    let time = media.seekTime

    if (time > element.duration) {
      time = element.duration
    }
    if (time < 0) {
      time = 0
    }
    setTime(mediaElement.element, time)
  }

  const getAutoPlay = () => {
    const isEditing = engineState.isEditing.value
    return isEditing ? false : media.autoplay
  }

  const playTrack = () => {
    let nextTrack = media.track
    const path = nextTrack === -1 ? '' : media.resources[nextTrack]

    if (nextTrack !== -1 && nextTrack >= media.resources.length) {
      // we already remove the case where we dont have any track
      // if current path is null, we simply skip over and move to next proper track
      nextTrack = (nextTrack + 1) % media.resources.length
      setComponent(entity, MediaComponent, { track: nextTrack })
      return
    }

    if (path === '') {
      setComponent(entity, MediaComponent, {
        isCurrentTrackLoaded: false,
        currentTrackTime: 0,
        currentTrackDuration: 0
      })
      removeComponent(entity, MediaElementComponent)
      return
    }

    const urlToPlay = encodeURI(AssetLoader.getAbsolutePath(path))

    const checkMediaElement = getOptionalComponent(entity, MediaElementComponent)
    /** do nothing if we are already playing this track */
    if (checkMediaElement && urlToPlay === checkMediaElement.element.src) {
      return
    }

    const assetClass = AssetLoader.getAssetClass(urlToPlay).toLowerCase()

    if (assetClass !== 'audio' && assetClass !== 'video') {
      addError(entity, MediaComponent, 'UNSUPPORTED_ASSET_CLASS')
      return
    }

    setComponent(entity, MediaComponent, { ended: false })

    if (
      !checkMediaElement ||
      !checkMediaElement.element ||
      checkMediaElement.element.nodeName.toLowerCase() !== assetClass
    ) {
      setUpMediaElement(entity, urlToPlay, media, audioContext, gainNodeMixBuses)
    }

    const mediaElement = getComponent(entity, MediaElementComponent)

    if (mediaElement.element.src === urlToPlay && media.isCurrentTrackLoaded) {
      const duration = mediaElement.element.duration
      setComponent(entity, MediaComponent, { currentTrackDuration: duration })
      return
    }

    mediaElement.hls?.destroy()
    setComponent(entity, MediaElementComponent, { hls: undefined })

    mediaElement.element.crossOrigin = 'anonymous'
    mediaElement.element.ontimeupdate = (event) => {
      const localMedia = getOptionalComponent(entity, MediaComponent)
      if (!localMedia) return
      const localMediaElement = getOptionalComponent(entity, MediaElementComponent)
      if (!localMediaElement) return
      if (!localMediaElement.element) return
      const time = localMediaElement.element.currentTime
      setComponent(entity, MediaComponent, { currentTrackTime: time })
    }

    setComponent(entity, MediaComponent, { isCurrentTrackLoaded: false })

    mediaElement.element.onloadeddata = (event) => {
      const localMedia = getComponent(entity, MediaComponent)
      const localMediaElement = getComponent(entity, MediaElementComponent)
      if (!localMedia) return
      if (!localMediaElement) return
      if (!localMediaElement.element) return
      const time = localMediaElement.element.duration
      setComponent(entity, MediaComponent, {
        currentTrackDuration: time,
        isCurrentTrackLoaded: true
      })
    }

    if (isHLS(urlToPlay)) {
      setupHLS(entity, urlToPlay).then((hls) => {
        setComponent(entity, MediaElementComponent, {
          hls
        })
        hls.attachMedia(mediaElement.element)
      })
    } else {
      mediaElement.element.src = urlToPlay
    }

    if (!media.paused) {
      mediaElement.element.play()
    }
    validateTime()
  }

  useEffect(() => {
    if (media.resources.length > 0 && media.track < 0) {
      setComponent(entity, MediaComponent, { track: 0 })
      if (getAutoPlay()) {
        setComponent(entity, MediaComponent, { paused: false })
        playTrack()
      }
    }
  }, [media.resources.length])

  useEffect(() => {
    if (!mediaElement) return
    const autoPlay = getAutoPlay()
    setComponent(entity, MediaComponent, { paused: !autoPlay })
    validateTime()
  }, [media.autoplay, !!mediaElement, engineState.isEditing])

  useEffect(() => {
    if (!rendererEntity) return
    setComponent(entity, BoundingBoxComponent)
    setComponent(entity, InputComponent, { highlight: false, grow: false })
    const renderer = getComponent(rendererEntity, RendererComponent).renderer!
    // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
    // in order to ensure media will play programmatically

    const handleAutoplay = () => {
      const mediaComponent = getOptionalComponent(entity, MediaElementComponent)

      // handle when we dont have autoplay enabled but have programatically started playback
      if (!getAutoPlay() && !media.paused) mediaComponent?.element.play()
      // handle when we have autoplay enabled but have paused playback
      if (getAutoPlay() && media.paused) setComponent(entity, MediaComponent, { paused: false })
      // handle when we have autoplay and mediaComponent is paused
      if (getAutoPlay() && !media.paused && mediaComponent?.element.paused) {
        mediaComponent.element.play()
        const autoplay = getAutoPlay()
        setComponent(entity, MediaComponent, { paused: !autoplay })
      }
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

    setCallback(entity, StandardCallbacks.PLAY, () => setComponent(entity, MediaComponent, { paused: false }))
    setCallback(entity, StandardCallbacks.PAUSE, () => setComponent(entity, MediaComponent, { paused: true }))
    setCallback(entity, StandardCallbacks.RESET, () => {
      const autoPlay = getAutoPlay()

      //using to force the react to update the seek time if already set to 0
      //due to media's seekTime is not being updated with the media elements current time
      let seekTime = media.seekTime
      if (seekTime == 0) {
        seekTime = 0.000001
      } else {
        seekTime = 0
      }

      setComponent(entity, MediaComponent, { seekTime, paused: !autoPlay })
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

  useEffect(() => {
    if (!mediaElement) return
    const element = mediaElement.element

    const resetMuted = () => {
      element.muted = false
      document.removeEventListener('pointerdown', resetMuted)
    }

    if (media.paused) {
      element.pause()
    } else {
      element.play().catch((error) => {
        if (error.name === 'NotAllowedError') {
          element.muted = true
          element.play()

          document.addEventListener('pointerdown', resetMuted)
        } else {
          console.error(error)
        }
      })
    }

    return () => {
      document.removeEventListener('pointerdown', resetMuted)
    }
  }, [media.paused, !!mediaElement])

  useEffect(() => {
    if (!mediaElement) return
    const isEditing = getState(EngineState).isEditing
    const isMuted = isEditing ? media.muteEditor : false
    const htmlMedia = mediaElement.element
    htmlMedia.muted = isMuted
  }, [media.muteEditor, mediaElement])

  useEffect(() => {
    if (mediaElement && !mediaElement.element.paused) {
      mediaElement.element.play() // if not paused, start play again
    }
  }, [mediaElement])

  useEffect(
    function updateTrackMetadata() {
      clearErrors(entity, MediaComponent)

      const paths = media.resources

      // If no paths or currently play path has been removed stop the track from playing
      // and signal to move to next track if one exists

      let mediaElement: HTMLMediaElement | undefined = undefined

      if (hasComponent(entity, MediaElementComponent)) {
        mediaElement = getComponent(entity, MediaElementComponent).element
      }

      if (mediaElement && (paths.length === 0 || media.track >= paths.length)) {
        mediaElement.pause()
        mediaElement.src = ''
        mediaElement.load()
        removeComponent(entity, MediaElementComponent)
        setComponent(entity, MediaComponent, { track: -1 })
      } else {
        const currentSrc = paths[media.track]
        //if the currently played track has been updated to a new src path
        if (!mediaElement || currentSrc !== mediaElement.src) {
          playTrack()
        }
      }

      for (const path of paths) {
        const assetClass = AssetLoader.getAssetClass(path).toLowerCase()
        if (path !== '' && assetClass !== 'audio' && assetClass !== 'video') {
          return addError(entity, MediaComponent, 'UNSUPPORTED_ASSET_CLASS')
        }
      }
    },
    [media.resources, media.resources[media.track]]
  )

  useEffect(() => {
    if (!media.ended) return // If current track is not ended, don't change the track

    if (!isClient) return

    if (media.resources.every((resource) => !resource)) return // if all resources are empty, we dont move to next track

    const track = media.track
    const nextTrack = getNextTrack(track, media.resources.length, media.playMode)

    //check if we haven't set up for single play yet, or if our sources don't match the new resources
    //** todo  make this more robust in a refactor, feels very error prone with edge cases */
    if (nextTrack === -1) {
      setComponent(entity, MediaComponent, { paused: true })
      return
    }
    setComponent(entity, MediaComponent, { ended: false })
    if (media.track === nextTrack) {
      if (!media.paused) {
        mediaElement?.element.play()
      }
    } else {
      setComponent(entity, MediaComponent, { track: nextTrack })
    }
  }, [media.ended, media.playMode])

  useEffect(() => {
    if (!isClient) return

    playTrack()
  }, [media.track])

  useEffect(
    function updateVolume() {
      const volume = media.volume
      const element = getOptionalComponent(entity, MediaElementComponent)?.element as HTMLMediaElement
      if (!element) return
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
      }
    },
    [media.volume]
  )

  useEffect(() => {
    if (!mediaElement) return
    mediaElement.element.muted = media.muted
  }, [media.muted, mediaElement])

  useEffect(
    function updateMixbus() {
      if (mediaElement == null) {
        return
      }
      const audioNodes = AudioNodeGroups.get(mediaElement.element)
      if (audioNodes) {
        audioNodes.gain.disconnect(audioNodes.mixbus)
        audioNodes.mixbus = media.isMusic ? gainNodeMixBuses.music : gainNodeMixBuses.soundEffects
        audioNodes.gain.connect(audioNodes.mixbus)
      }
    },
    [mediaElement, media.isMusic]
  )

  useEffect(() => {
    validateTime()
  }, [media.seekTime])

  return null
}

const setUpMediaElement = (
  entity: Entity,
  path: string,
  media: ComponentType<typeof MediaComponent>,
  audioContext: AudioContext,
  gainNodeMixBuses: {
    mediaStreams: GainNode
    notifications: GainNode
    music: GainNode
    soundEffects: GainNode
  }
) => {
  const assetClass = AssetLoader.getAssetClass(path).toLowerCase()

  const hasMediaElementComponent = hasComponent(entity, MediaElementComponent)
  let element: HTMLMediaElement | null = null
  if (hasMediaElementComponent) {
    element = getComponent(entity, MediaElementComponent).element as HTMLMediaElement
  } else {
    element = document.createElement(assetClass) as HTMLMediaElement
  }

  setComponent(entity, MediaElementComponent, {
    element: element
  })
  const mediaElementState = getMutableComponent(entity, MediaElementComponent)

  element.crossOrigin = 'anonymous'
  element.preload = 'auto'
  element.muted = false
  element.setAttribute('playsinline', 'true')

  const signal = mediaElementState.abortController.signal

  element.addEventListener(
    'playing',
    () => {
      setComponent(entity, MediaComponent, { waiting: false })
      clearErrors(entity, MediaElementComponent)
    },
    { signal }
  )
  element.addEventListener(
    'waiting',
    () => {
      setComponent(entity, MediaComponent, { waiting: true })
    },
    { signal }
  )
  element.addEventListener(
    'error',
    (err) => {
      addError(entity, MediaElementComponent, 'MEDIA_ERROR', err.message)
      setComponent(entity, MediaComponent, { waiting: false, ended: true })
    },
    { signal }
  )

  element.addEventListener(
    'ended',
    () => {
      setComponent(entity, MediaComponent, { waiting: false, ended: true })
    },
    { signal }
  )

  const audioNodes = createAudioNodeGroup(
    element,
    audioContext.createMediaElementSource(element),
    media.isMusic ? gainNodeMixBuses.music : gainNodeMixBuses.soundEffects
  )

  audioNodes.gain.gain.setTargetAtTime(media.volume, audioContext.currentTime, 0.1)
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

export function setTime(element: HTMLMediaElement, time: number) {
  if (!element || time < 0 || element.currentTime === time || time > element.duration) return
  element.currentTime = time
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
    // random shuffle, don't play the same track again unless it is the only track
    nextTrack = Math.floor(Math.random() * (trackCount - 1))
    if (nextTrack >= currentTrack && currentTrack >= 0) {
      nextTrack += 1
    }
    if (nextTrack >= trackCount) {
      nextTrack = trackCount - 1
    }
  } else if (currentMode == PlayMode.singleloop) {
    nextTrack = currentTrack
  } else {
    //PlayMode.Loop
    nextTrack = (currentTrack + 1) % trackCount
  }

  return nextTrack
}
