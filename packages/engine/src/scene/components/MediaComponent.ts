import Hls from 'hls.js'
import { startTransition, useEffect } from 'react'

import { hookstate } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { removePannerNode } from '../../audio/systems/PositionalAudioSystem'
import { deepEqual } from '../../common/functions/deepEqual'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { getEngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  ComponentType,
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntityReactor, EntityReactorParams } from '../../ecs/functions/EntityFunctions'
import { PlayMode } from '../constants/PlayMode'
import { addError, removeError } from '../functions/ErrorFunctions'
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
  const gain = Engine.instance.audioContext.createGain()
  source.connect(gain)
  gain.connect(mixbus)
  const panner = Engine.instance.audioContext.createPanner()
  const group = { source, gain, mixbus, panner } as AudioNodeGroup
  AudioNodeGroups.set(el, group)
  return group
}

export const MediaElementComponent = defineComponent({
  name: 'MediaElement',

  onAdd: (entity) => {
    return {
      element: undefined! as HTMLMediaElement,
      hls: undefined as Hls | undefined,
      abortController: new AbortController()
    }
  },

  toJSON: () => {
    return undefined as any as { element: HTMLMediaElement }
  },

  onUpdate: (entity, component, json) => {
    if (typeof json.element === 'object' && json.element !== component.element)
      component.element = json.element as HTMLMediaElement
  },

  onRemove: (entity, component) => {
    component.hls?.destroy()
    component.hls = undefined
    const audioNodeGroup = AudioNodeGroups.get(component.element)
    if (audioNodeGroup && audioNodeGroup.panner) removePannerNode(audioNodeGroup)
    AudioNodeGroups.delete(component.element)
    component.element.pause()
    component.element.removeAttribute('src')
    component.element.load()
    component.element.remove()
    component.element = undefined!
    component.abortController.abort()
  }
})

export const MediaComponent = defineComponent({
  name: 'XRE_media',

  onAdd: (entity) => {
    const state = hookstate({
      controls: false,
      synchronize: true,
      autoplay: true,
      /**
       * TODO: refactor this into a ScheduleComponent for invoking callbacks at scheduled times
       * The auto start time for the playlist, in Unix/Epoch time (milliseconds).
       * If this value is negative, media playback must be explicitly started.
       * If this value is non-negative and in the past, playback as soon as possible.
       * If this value is in the future, begin playback at the appointed time.
       */
      // autoStartTime: -1,
      paths: [] as string[],
      playMode: PlayMode.loop as PlayMode,
      isMusic: false,
      volume: 1,
      // runtime props
      paused: true,
      playing: false,
      track: 0,
      trackDurations: [] as number[]
    })

    createEntityReactor(entity, MediaReactor)

    return state
  },

  onRemove: (entity, component) => {
    removeComponent(entity, MediaElementComponent)
  },

  toJSON: (entity, component) => {
    return {
      controls: component.controls.value,
      autoplay: component.autoplay.value,
      paths: component.paths.value,
      playMode: component.playMode.value,
      isMusic: component.isMusic.value
    }
  },

  onUpdate: (entity, component, json) => {
    startTransition(() => {
      if (typeof json.paths === 'object') {
        // backwards-compat: update uvol paths to point to the video files
        const paths = json.paths.map((path) => path.replace('.drcs', '.mp4').replace('.uvol', '.mp4'))
        if (!deepEqual(component.paths.value, json.paths)) component.paths.set(paths)
      }

      if (typeof json.controls === 'boolean' && json.controls !== component.controls.value)
        component.controls.set(json.controls)

      if (typeof json.autoplay === 'boolean' && json.autoplay !== component.autoplay.value)
        component.autoplay.set(json.autoplay)

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

      if (typeof json.isMusic === 'boolean' && component.isMusic.value !== json.isMusic)
        component.isMusic.set(json.isMusic)
    })

    return component
  }
})

const MediaReactor = ({ entity, destroyReactor }: EntityReactorParams) => {
  const media = useComponent(entity, MediaComponent)
  const mediaElement = useComponent(entity, MediaElementComponent)

  useEffect(() => {
    if (!media) destroyReactor()
  }, [media])

  useEffect(
    function updatePlay() {
      if (!media || !mediaElement) return
      if (media.paused.value) {
        mediaElement.element.pause()
      } else {
        mediaElement.element.play()
      }
    },
    [media?.paused, mediaElement]
  )

  useEffect(
    function updateTrackMetadata() {
      if (!media) return

      const paths = media.paths.value

      for (const path of paths) {
        const assetClass = AssetLoader.getAssetClass(path).toLowerCase()
        if (assetClass !== 'audio' && assetClass !== 'video') {
          addError(
            entity,
            'mediaError',
            `invalid assetClass "${assetClass}" for path "${path}"; expected "audio" or "video"`
          )
          return
        }
      }

      removeError(entity, 'mediaError')

      const metadataListeners = [] as Array<{ tempElement: HTMLMediaElement; listener: () => void }>

      for (const [i, path] of paths.entries()) {
        const assetClass = AssetLoader.getAssetClass(path).toLowerCase()
        const tempElement = document.createElement(assetClass) as HTMLMediaElement
        const listener = () => media.trackDurations[i].set(tempElement.duration)
        metadataListeners.push({ tempElement, listener })
        tempElement.addEventListener('loadedmetadata', listener)
        tempElement.crossOrigin = 'anonymous'
        tempElement.preload = 'metadata'
        tempElement.src = path
        tempElement.load()
      }

      // handle autoplay
      if (media.autoplay.value && getEngineState().userHasInteracted.value) media.paused.set(false)

      return () => {
        for (const { tempElement, listener } of metadataListeners) {
          tempElement.removeEventListener('loadedmetadata', listener)
          tempElement.src = ''
          tempElement.load()
        }
      }
    },
    [media?.paths]
  )

  useEffect(
    function updateMediaElement() {
      if (!isClient || !media) return

      const track = media.track.value
      const path = media.paths[track].value
      if (!path) {
        if (hasComponent(entity, MediaElementComponent)) removeComponent(entity, MediaElementComponent)
        return
      }

      let mediaElement = getComponent(entity, MediaElementComponent)

      const assetClass = AssetLoader.getAssetClass(path).toLowerCase()

      if (assetClass !== 'audio' && assetClass !== 'video') {
        addError(entity, 'mediaError', `invalid asset class ${assetClass}; only audio and video are supported`)
        return
      }

      if (!mediaElement || mediaElement.element.nodeName.toLowerCase() !== assetClass) {
        mediaElement = setComponent(entity, MediaElementComponent, {
          element: document.createElement(assetClass) as HTMLMediaElement
        })

        mediaElement.element.crossOrigin = 'anonymous'
        mediaElement.element.preload = 'auto'
        mediaElement.element.muted = false
        mediaElement.element.setAttribute('playsinline', 'true')

        const signal = mediaElement.abortController.signal

        mediaElement.element.addEventListener(
          'playing',
          () => {
            media.playing.set(true), removeError(entity, `mediaError`)
          },
          { signal }
        )
        mediaElement.element.addEventListener('waiting', () => media.playing.set(false), { signal })
        mediaElement.element.addEventListener(
          'error',
          (err) => {
            addError(entity, `mediaError`, err.message)
            if (media.playing.value) media.track.set(getNextTrack(media))
          },
          { signal }
        )

        mediaElement.element.addEventListener(
          'ended',
          () => {
            if (media.playMode.value === PlayMode.single) return
            media.track.set(getNextTrack(media))
          },
          { signal }
        )

        const audioNodes = createAudioNodeGroup(
          mediaElement.element,
          Engine.instance.audioContext.createMediaElementSource(mediaElement.element),
          media.isMusic.value ? Engine.instance.gainNodeMixBuses.music : Engine.instance.gainNodeMixBuses.soundEffects
        )

        audioNodes.gain.gain.setTargetAtTime(media.volume.value, Engine.instance.audioContext.currentTime, 0.1)
      }

      mediaElement.hls?.destroy()
      mediaElement.hls = undefined

      if (isHLS(path)) {
        mediaElement.hls = setupHLS(entity, path)
        mediaElement.hls.attachMedia(mediaElement.element)
      } else {
        mediaElement.element.src = path
      }
    },
    [media?.paths, media?.track]
  )

  useEffect(
    function updateVolume() {
      if (!media) return
      const volume = media.volume.value
      const element = getComponent(entity, MediaElementComponent)?.element
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.gain.setTargetAtTime(volume, Engine.instance.audioContext.currentTime, 0.1)
      }
    },
    [media?.volume]
  )

  useEffect(
    function updateMixbus() {
      if (!media || !mediaElement) return
      const element = mediaElement.element
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.disconnect(audioNodes.mixbus)
        audioNodes.mixbus = media.isMusic.value
          ? Engine.instance.gainNodeMixBuses.music
          : Engine.instance.gainNodeMixBuses.soundEffects
        audioNodes.gain.connect(audioNodes.mixbus)
      }
    },
    [mediaElement, media?.isMusic]
  )
}

export const SCENE_COMPONENT_MEDIA = 'media'

export const setupHLS = (entity: Entity, url: string): Hls => {
  const hls = new Hls()
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

      addError(entity, 'error', 'Error Loading video')
    }
  })

  // hls.once(Hls.Events.LEVEL_LOADED, () => { resolve() })
  hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    hls.loadSource(url)
    hls.on(Hls.Events.MANIFEST_PARSED, (_event, _data) => {
      removeError(entity, 'error')
    })
  })

  return hls
}

export function getNextTrack(media: ComponentType<typeof MediaComponent>) {
  const currentTrack = media.track.value
  const numTracks = media.paths.value.length
  let nextTrack = 0

  if (media.playMode.value == PlayMode.random) {
    // todo: smart random, i.e., lower probability of recently played tracks
    nextTrack = Math.floor(Math.random() * numTracks)
  } else if (media.playMode.value == PlayMode.single) {
    nextTrack = (currentTrack + 1) % numTracks
  } else if (media.playMode.value == PlayMode.singleloop) {
    nextTrack = currentTrack
  } else {
    //PlayMode.Loop
    nextTrack = (currentTrack + 1) % numTracks
  }

  return nextTrack
}
