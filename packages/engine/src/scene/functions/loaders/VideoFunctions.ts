import Hls from 'hls.js'
import { Group, LinearFilter, Mesh, MeshStandardMaterial, sRGBEncoding, VideoTexture } from 'three'

import { AudioComponent } from '../../../audio/components/AudioComponent'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { ImageProjection } from '../../classes/ImageUtils'
import { CallbackComponent } from '../../components/CallbackComponent'
import { ImageComponent } from '../../components/ImageComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { MediaElementComponent } from '../../components/MediaElementComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VideoComponent, VideoComponentType } from '../../components/VideoComponent'
import { PlayMode } from '../../constants/PlayMode'
import { addError, removeError } from '../ErrorFunctions'
import isHLS from '../isHLS'
import { createAudioNode } from './AudioFunctions'
import { resizeImageMesh } from './ImageFunctions'
import { getNextPlaylistItem, updateAutoStartTimeForMedia } from './MediaFunctions'

export const deserializeVideo: ComponentDeserializeFunction = (entity: Entity, data: VideoComponentType) => {
  const video = Object.assign(VideoComponent.init(), data)
  addComponent(entity, VideoComponent, video)
}

export const updateVideo: ComponentUpdateFunction = (entity: Entity) => {
  if (!hasComponent(entity, Object3DComponent)) addComponent(entity, Object3DComponent, { value: new Group() })
  const group = getComponent(entity, Object3DComponent).value as Mesh<any, MeshStandardMaterial>

  const videoComponent = getComponent(entity, VideoComponent)
  const audioComponent = getComponent(entity, AudioComponent)
  const mediaComponent = getComponent(entity, MediaComponent)
  const mesh = videoComponent.mesh

  if (mesh.parent !== group) group.add(mesh)

  const currentPath = mediaComponent.paths.length ? mediaComponent.paths[mediaComponent.currentSource] : ''

  const videoElementExists = document.getElementById(videoComponent.elementId)

  if (!hasComponent(entity, MediaElementComponent)) {
    if (videoElementExists) {
      addComponent(entity, MediaElementComponent, videoElementExists)
    } else {
      const el = document.createElement('video')
      el.setAttribute('crossOrigin', 'anonymous')
      if (
        mediaComponent.playMode === PlayMode.SingleLoop ||
        (mediaComponent.playMode === PlayMode.Loop && mediaComponent.paths.length === 1)
      )
        el.setAttribute('loop', 'true')
      el.setAttribute('preload', 'metadata')

      // Setting autoplay to false will not work
      // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-autoplay
      if (mediaComponent.autoplay) el.setAttribute('autoplay', 'true')

      el.setAttribute('playsInline', 'true')
      el.setAttribute('playsinline', 'true')
      el.setAttribute('webkit-playsInline', 'true')
      el.setAttribute('webkit-playsinline', 'true')
      el.setAttribute('muted', 'true')
      el.muted = true // Needed for some browsers to load videos
      el.hidden = true
      document.body.appendChild(el)

      el.addEventListener('playing', () => {
        mediaComponent.playing = true
      })
      el.addEventListener('pause', () => {
        mediaComponent.playing = false
      })
      el.addEventListener('ended', () => {
        if (mediaComponent.stopOnNextTrack) return
        const nextItem = getNextPlaylistItem(entity)
        mediaComponent.currentSource = nextItem
        el.src = mediaComponent.paths[mediaComponent.currentSource]
        el.play()
      })

      addComponent(entity, CallbackComponent, {
        play: () => el.play(),
        pause: () => el.pause()
        /** todo, add next/previous */
      })

      addComponent(entity, MediaElementComponent, el)

      el.id = videoComponent.elementId

      createAudioNode(
        el,
        Engine.instance.audioContext.createMediaElementSource(el),
        audioComponent.isMusic ? Engine.instance.gainNodeMixBuses.music : Engine.instance.gainNodeMixBuses.soundEffects
      )
    }
  }

  const el = getComponent(entity, MediaElementComponent) as HTMLVideoElement

  if (!(mesh.material.map as VideoTexture)?.isVideoTexture) {
    const texture = new VideoTexture(el)

    texture.encoding = sRGBEncoding
    texture.minFilter = LinearFilter

    if (mesh.material.map) mesh.material.map?.dispose()
    mesh.material.map = texture
  }

  const videoTexture = mesh.material.map as VideoTexture

  if (el.src === '' || currentPath !== el.src) {
    try {
      if (isHLS(currentPath)) {
        if (videoComponent.hls) videoComponent.hls.destroy()
        videoComponent.hls = setupHLS(entity, currentPath)
        videoComponent.hls?.attachMedia(el)
      }
      // else if (isDash(url)) {
      //   const { MediaPlayer } = await import('dashjs')
      //   component.dash = MediaPlayer().create();
      //   component.dash.initialize(el, src, component.autoPlay)
      //   component.dash.on('ERROR', (e) => console.error('ERROR', e)
      // }
      else {
        el.addEventListener('error', (err) => {
          console.error(err)
          addError(entity, 'error', 'Error Loading video')
        })
        el.addEventListener('loadeddata', () => removeError(entity, 'error'))
        el.src = currentPath
      }

      el.addEventListener(
        'loadeddata',
        () => {
          el.muted = false

          if (el.autoplay) {
            if (getEngineState().userHasInteracted.value) {
              el.play()
            }
          }

          if (videoComponent.maintainAspectRatio) {
            videoTexture.image.height = videoTexture.image.videoHeight
            videoTexture.image.width = videoTexture.image.videoWidth
          }

          if (getComponent(entity, ImageComponent)?.projection === ImageProjection.Flat) resizeImageMesh(mesh)

          if (!Engine.instance.isEditor) updateAutoStartTimeForMedia(entity)
        },
        { once: true }
      )
    } catch (error) {
      console.error(error)
    }
  }
  if (videoComponent.elementId !== el.id) el.id = videoComponent.elementId
}

export const serializeVideo: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, VideoComponent)
  return {
    elementId: component.elementId,
    maintainAspectRatio: component.maintainAspectRatio
  }
}

export const prepareVideoForGLTFExport: ComponentPrepareForGLTFExportFunction = (video) => {}

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
          // hls.recoverMediaError();
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
