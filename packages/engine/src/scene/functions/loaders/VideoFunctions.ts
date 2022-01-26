import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Mesh, MeshStandardMaterial, sRGBEncoding, LinearFilter, VideoTexture } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VideoComponent, VideoComponentType } from '../../components/VideoComponent'
import { resolveMedia } from '../../../common/functions/resolveMedia'
import { isClient } from '../../../common/functions/isClient'
import { ImageComponent } from '../../components/ImageComponent'
import { ImageProjection } from '../../classes/ImageUtils'
import { resizeImageMesh } from './ImageFunctions'
import { updateAutoStartTimeForMedia } from './MediaFunctions'
import { MediaComponent } from '../../components/MediaComponent'
import isHLS from '../isHLS'
import Hls from 'hls.js'
import { accessEngineState, EngineActions } from '../../../ecs/classes/EngineService'
import { receiveActionOnce } from '../../../networking/functions/matchActionOnce'
import { EngineEvents } from '../../../ecs/classes/EngineEvents'
import { ErrorComponent } from '../../components/ErrorComponent'
import { dispatchLocal } from '../../../networking/functions/dispatchFrom'

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
  if (!isClient) {
    return
  }

  const mediaComponent = getComponent(entity, MediaComponent)

  console.debug
  const obj3d = getComponent(entity, Object3DComponent).value
  const video = obj3d.userData.mesh
  video.name = VIDEO_MESH_NAME

  const el = document.createElement('video')
  el.setAttribute('crossOrigin', 'anonymous')
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
  obj3d.userData.videoEl = el

  el.addEventListener('playing', () => {
    mediaComponent.playing = true
  })
  el.addEventListener('pause', () => {
    mediaComponent.playing = false
  })
  mediaComponent.el = el

  const props = parseVideoProperties(json.props) as VideoComponentType

  addComponent(entity, VideoComponent, props)

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VIDEO)

  updateVideo(entity, props)
}

export const updateVideo: ComponentUpdateFunction = async (entity: Entity, properties: VideoComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as Mesh<any, MeshStandardMaterial>
  const mesh = obj3d.userData.mesh
  const component = getComponent(entity, VideoComponent)

  if (properties.videoSource) {
    try {
      const { url, contentType } = await resolveMedia(component.videoSource)
      if (isHLS(url, contentType)) {
        if (component.hls) component.hls.destroy()
        component.hls = setupHLS(entity, url)
        component.hls?.attachMedia(obj3d.userData.videoEl)
      }
      // else if (isDash(url)) {
      //   const { MediaPlayer } = await import('dashjs')
      //   component.dash = MediaPlayer().create();
      //   component.dash.initialize(obj3d.userData.videoEl, src, component.autoPlay)
      //   component.dash.on('ERROR', (e) => console.error('ERROR', e)
      // }
      else {
        obj3d.userData.videoEl.addEventListener('error', () => {
          const errorComponent = getComponent(entity, ErrorComponent) ?? addComponent(entity, ErrorComponent, {})
          errorComponent.error = 'Error Loading video'
          dispatchLocal(EngineActions.updateEntityError(entity))
        })
        obj3d.userData.videoEl.addEventListener('loadeddata', () => {
          removeComponent(entity, ErrorComponent)
          dispatchLocal(EngineActions.updateEntityError(entity, true))
        })

        obj3d.userData.videoEl.src = url
      }

      const texture = new VideoTexture(obj3d.userData.videoEl)
      obj3d.userData.videoEl.currentTime = 1

      if (!texture) return

      texture.encoding = sRGBEncoding
      texture.minFilter = LinearFilter

      if (mesh.material.map) mesh.material.map?.dispose()
      mesh.material.map = texture

      obj3d.userData.videoEl.addEventListener(
        'loadeddata',
        () => {
          obj3d.userData.videoEl.muted = false

          if (obj3d.userData.videoEl.autoplay) {
            if (accessEngineState().userHasInteracted.value) {
              obj3d.userData.videoEl.play()
            } else {
              receiveActionOnce(EngineEvents.EVENTS.SET_USER_HAS_INTERACTED, () => {
                obj3d.userData.videoEl.play()
              })
            }
          }

          mesh.material.map.image.height = mesh.material.map.image.videoHeight
          mesh.material.map.image.width = mesh.material.map.image.videoWidth
          if (getComponent(entity, ImageComponent)?.projection === ImageProjection.Flat) resizeImageMesh(mesh)

          const audioSource = Engine.audioListener.context.createMediaElementSource(obj3d.userData.videoEl)
          obj3d.userData.audioEl.setNodeSource(audioSource)

          updateAutoStartTimeForMedia(entity)
        },
        { once: true }
      )
    } catch (error) {
      console.error(error)
    }
  }

  if (typeof properties.elementId !== 'undefined') obj3d.userData.videoEl.id = component.elementId
}

export const serializeVideo: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, VideoComponent) as VideoComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_VIDEO,
    props: {
      videoSource: component.videoSource,
      elementId: component.elementId
    }
  }
}

export const prepareVideoForGLTFExport: ComponentPrepareForGLTFExportFunction = (video) => {
  if (video.userData.videoEl) {
    if (video.userData.videoEl.parent) video.userData.videoEl.remove()
    delete video.userData.videoEl
  }

  if (video.userData.mesh) {
    if (video.userData.mesh.parent) video.userData.mesh.removeFromParent()
    delete video.userData.mesh
  }
}

const setupHLS = (entity: Entity, url: string): Hls => {
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

      const errorComponent = getComponent(entity, ErrorComponent) ?? addComponent(entity, ErrorComponent, {})
      errorComponent.error = 'Error Loading video'
      dispatchLocal(EngineActions.updateEntityError(entity))
    }
  })

  // hls.once(Hls.Events.LEVEL_LOADED, () => { resolve() })
  hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    hls.loadSource(url)
    hls.on(Hls.Events.MANIFEST_PARSED, (_event, _data) => {
      removeComponent(entity, ErrorComponent)
      dispatchLocal(EngineActions.updateEntityError(entity, true))
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

const parseVideoProperties = (props): Partial<VideoComponentType> => {
  return {
    videoSource: props.videoSource ?? SCENE_COMPONENT_VIDEO_DEFAULT_VALUES.videoSource,
    elementId: props.elementId ?? SCENE_COMPONENT_VIDEO_DEFAULT_VALUES.elementId
  }
}
