import Hls from 'hls.js'
import { LinearFilter, Mesh, MeshStandardMaterial, Object3D, sRGBEncoding, VideoTexture } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { ImageProjection } from '../../classes/ImageUtils'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { ImageComponent } from '../../components/ImageComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VideoComponent, VideoComponentType } from '../../components/VideoComponent'
import { PlayMode } from '../../constants/PlayMode'
import { addError, removeError } from '../ErrorFunctions'
import isHLS from '../isHLS'
import { resizeImageMesh } from './ImageFunctions'
import { getNextPlaylistItem, updateAutoStartTimeForMedia } from './MediaFunctions'

export const SCENE_COMPONENT_VIDEO = 'video'
export const VIDEO_MESH_NAME = 'VideoMesh'
export const SCENE_COMPONENT_VIDEO_DEFAULT_VALUES = {
  videoSource: '',
  elementId: 'video-' + Date.now()
}

export const deserializeVideo: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<VideoComponentType>
) => {
  if (!isClient) return
  const props = parseVideoProperties(json.props) as VideoComponentType
  addComponent(entity, VideoComponent, props)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VIDEO)
}

export const updateVideo: ComponentUpdateFunction = (entity: Entity, properties: VideoComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as Mesh<any, MeshStandardMaterial>

  const videoComponent = getComponent(entity, VideoComponent)
  const mediaComponent = getComponent(entity, MediaComponent)

  const currentPath = mediaComponent.paths.length ? mediaComponent.paths[mediaComponent.currentSource] : ''

  if (!mediaComponent.el) {
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
    mediaComponent.el = el
  }

  const el = getComponent(entity, MediaComponent).el! as HTMLVideoElement
  const mesh = obj3d.userData.mesh as Mesh<any, any>

  if (currentPath !== el.src) {
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
        el.addEventListener('error', () => addError(entity, 'error', 'Error Loading video'))
        el.addEventListener('loadeddata', () => removeError(entity, 'error'))
        el.src = currentPath
      }

      const texture = new VideoTexture(el)
      el.currentTime = 1

      if (!texture) return

      texture.encoding = sRGBEncoding
      texture.minFilter = LinearFilter

      if (mesh.material.map) mesh.material.map?.dispose()
      mesh.material.map = texture

      el.addEventListener(
        'loadeddata',
        () => {
          el.muted = false

          if (el.autoplay) {
            if (getEngineState().userHasInteracted.value) {
              el.play()
            }
          }

          mesh.material.map.image.height = mesh.material.map.image.videoHeight
          mesh.material.map.image.width = mesh.material.map.image.videoWidth
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
  const component = getComponent(entity, VideoComponent) as VideoComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_VIDEO,
    props: {
      elementId: component.elementId
    }
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

export const toggleVideo = (entity: Entity) => {
  const data = getComponent(entity, Object3DComponent)?.value.userData
  if (!data) return

  if (data.videoEl.paused) {
    data.audioEl.play()
    data.videoEl.play()
  } else {
    data.audioEl.stop()
    data.videoEl.pause()
  }
}

export const parseVideoProperties = (props): Partial<VideoComponentType> => {
  return {
    elementId: props.elementId ?? SCENE_COMPONENT_VIDEO_DEFAULT_VALUES.elementId
  }
}
