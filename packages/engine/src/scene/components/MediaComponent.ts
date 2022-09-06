import { subscribable } from '@hookstate/subscribable'
import Hls from 'hls.js'

import { hookstate, StateMethodsDestroy } from '@xrengine/hyperflux/functions/StateFunctions'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetClass } from '../../assets/enum/AssetClass'
import { AudioNodeGroups, createAudioNodeGroup } from '../../audio/systems/MediaSystem'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentType,
  defineComponent,
  getComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { entityExists } from '../../ecs/functions/EntityFunctions'
import { PlayMode } from '../constants/PlayMode'
import { addError, removeError } from '../functions/ErrorFunctions'
import isHLS from '../functions/isHLS'

export const MediaElementComponent = defineComponent<{
  element: HTMLMediaElement
  hls: Hls | undefined
}>({
  name: 'MediaElement',

  onRemove: (entity, component) => {
    component.hls?.destroy()
    component.element?.pause()
    component.element?.removeAttribute('src')
    component.element?.load()
    component.element?.remove()
  }
})

// temporary media elements for collecting metadata
const metadataElements = new Set<HTMLMediaElement>()

export const MediaComponent = defineComponent({
  name: 'XRE_media',

  onAdd: (entity, json) => {
    const paths = json.paths as string[]
    if (!paths) throw new Error('')

    const state = hookstate(
      {
        controls: false,
        autoplay: false,
        autoStartTime: 0,
        paths: [] as string[],
        playMode: PlayMode.Loop,
        isMusic: false,
        volume: 1,
        // runtime props
        paused: true,
        playing: false,
        track: -1,
        trackDurations: [] as number[]
      },
      subscribable()
    )

    function handleAutoplay() {
      if (!entityExists(entity)) {
        window.removeEventListener('pointerdown', handleAutoplay)
        window.removeEventListener('keypress', handleAutoplay)
      }
      if (!state.autoplay.value) return
      if (state.playing.value) return

      const mediaElement = getComponent(entity, MediaElementComponent)
      if (!mediaElement) return

      if (state.autoStartTime.value < Date.now() && mediaElement.element.src) {
        mediaElement.element.play()
      } else if (state.trackDurations.value.length === state.paths.value.length) {
        let currentPlaybackTime = Date.now() - state.autoStartTime.value
        for (const [track, duration] of state.trackDurations.value.entries()) {
          if (currentPlaybackTime > duration) {
            currentPlaybackTime -= duration
            continue
          }
          state.track.set(track)
          mediaElement.element.currentTime = currentPlaybackTime
          mediaElement.element.play()
        }
      }
    }
    window.addEventListener('pointerdown', handleAutoplay)
    window.addEventListener('keypress', handleAutoplay)

    const updateMediaElement = () => {
      const track = state.track.value
      const path = state.paths[track].value
      if (!path) {
        removeComponent(entity, MediaElementComponent)
        return
      }

      let mediaElement = getComponent(entity, MediaElementComponent)

      const assetClass = AssetLoader.getAssetClass(path).toLowerCase()

      if (!mediaElement || mediaElement.element.nodeName.toLowerCase() !== assetClass) {
        removeComponent(entity, MediaElementComponent)

        const element = document.createElement(assetClass) as HTMLMediaElement
        element.addEventListener('play', () => state.paused.set(false))
        element.addEventListener('pause', () => state.paused.set(true))
        element.addEventListener('playing', () => {
          state.playing.set(true), removeError(entity, `mediaError`)
        })
        element.addEventListener('waiting', () => state.playing.set(false))
        element.addEventListener('error', (err) => addError(entity, `mediaError`, err.message))

        element.addEventListener('ended', () => {
          if (state.playMode.value === PlayMode.Single) return
          state.track.set(getNextTrack(state))
        })

        element.crossOrigin = 'anonymous'
        element.preload = 'metadata'
        element.autoplay = true // this is only so that the playlist can play programatically; initial autoplay is via handleAutoplay
        element.setAttribute('playsInline', 'true')

        const audioNodes = createAudioNodeGroup(
          element,
          Engine.instance.audioContext.createMediaElementSource(element),
          state.isMusic.value ? Engine.instance.gainNodeMixBuses.music : Engine.instance.gainNodeMixBuses.soundEffects
        )

        audioNodes.gain.gain.setTargetAtTime(state.volume.value, Engine.instance.audioContext.currentTime, 0.1)

        addComponent(entity, MediaElementComponent, {
          element,
          hls: undefined
        })
        mediaElement = getComponent(entity, MediaElementComponent)
      }

      mediaElement.hls?.destroy()
      mediaElement.hls = undefined

      if (isHLS(path)) {
        mediaElement.hls = setupHLS(entity, path)
        mediaElement.hls.attachMedia(mediaElement.element)
      } else {
        mediaElement.element.src = path
      }

      mediaElement.element.play()
    }

    let metadataVersion = 0
    const updateTrackMetadata = () => {
      const paths = state.paths.value
      metadataVersion++

      // autoplay to track 0
      if (state.autoplay.value) state.track.set(0)

      // udpate track durations from metadata
      state.trackDurations.set([])
      for (const [i, path] of paths.entries()) {
        const assetClass = AssetLoader.getAssetClass(path).toLowerCase()
        if (assetClass !== 'audio' && assetClass !== 'video') {
          addError(
            entity,
            'mediaError',
            `invalid assetClass "${assetClass}" for path "${path}"; expected "audio" or "video"`
          )
          return
        }
        const tempElement = document.createElement(assetClass) as HTMLMediaElement
        const prevVersion = metadataVersion
        tempElement.addEventListener('loadedmetadata', () => {
          metadataElements.delete(tempElement)
          if (prevVersion === metadataVersion) state.trackDurations[i].set(tempElement.duration)
        })
        tempElement.preload = 'metadata'
        tempElement.src = path
        tempElement.load()
        metadataElements.add(tempElement)
      }

      removeError(entity, 'mediaError')
    }

    const updateVolume = () => {
      const volume = state.volume.value
      const element = getComponent(entity, MediaElementComponent)?.element
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.gain.setTargetAtTime(volume, Engine.instance.audioContext.currentTime, 0.1)
      }
    }

    const updateMixbus = () => {
      const element = getComponent(entity, MediaElementComponent)?.element
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.disconnect(audioNodes.mixbus)
        audioNodes.mixbus = state.isMusic.value
          ? Engine.instance.gainNodeMixBuses.music
          : Engine.instance.gainNodeMixBuses.soundEffects
        audioNodes.gain.connect(audioNodes.mixbus)
      }
    }

    // bind track to media element
    state.track.subscribe(updateMediaElement)
    // bind paths to track metadata
    state.paths.subscribe(updateTrackMetadata)
    // bind volume
    state.volume.subscribe(updateVolume)
    // bind mixbus
    state.isMusic.subscribe(updateMixbus)

    state.merge(json)

    // remove the following once subscribers detect merged state https://github.com/avkonst/hookstate/issues/338
    updateMediaElement()
    updateTrackMetadata()
    updateVolume()
    updateMixbus()

    return state
  },

  onRemove: (entity, component) => {
    removeComponent(entity, MediaElementComponent)
    component.paths.set([])
    ;(component as typeof component & StateMethodsDestroy).destroy()
  },

  toJSON: (entity, component) => {
    return {
      controls: component.controls.value,
      autoplay: component.autoplay.value,
      autoStartTime: component.autoStartTime.value,
      paths: component.paths.value,
      playMode: component.playMode.value
    }
  }
})

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

  if (media.playMode.value == PlayMode.Random) {
    nextTrack = Math.floor(Math.random() * numTracks)
  } else if (media.playMode.value == PlayMode.Single) {
    nextTrack = (currentTrack + 1) % numTracks
  } else if (media.playMode.value == PlayMode.SingleLoop) {
    nextTrack = currentTrack
  } else {
    //PlayMode.Loop
    nextTrack = (currentTrack + 1) % numTracks
  }

  return nextTrack
}
