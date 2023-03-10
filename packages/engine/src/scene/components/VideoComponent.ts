import { useEffect } from 'react'
import { DoubleSide, Group, Mesh, MeshBasicMaterial, Side, Vector2 } from 'three'
import { VideoTexture } from 'three'

import {
  defineComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { ContentFitType } from '../../xrui/functions/ObjectFitFunctions'
import { addError, clearErrors } from '../functions/ErrorFunctions'
import { ObjectFitFunctions } from './../../xrui/functions/ObjectFitFunctions'
import { addObjectToGroup, removeObjectFromGroup } from './../components/GroupComponent'
import { resizeImageMesh } from './../components/ImageComponent'
import { MediaElementComponent } from './../components/MediaComponent'
import { UUIDComponent } from './../components/UUIDComponent'
import { PLANE_GEO } from './ImageComponent'

export const VideoComponent = defineComponent({
  name: 'EE_video',

  onInit: (entity) => {
    const videoGroup = new Group()
    videoGroup.name = `video-group-${entity}`
    const videoMesh = new Mesh(PLANE_GEO, new MeshBasicMaterial())
    videoGroup.add(videoMesh)

    return {
      side: DoubleSide as Side,
      size: new Vector2(1, 1),
      fit: 'contain' as ContentFitType,
      mediaUUID: '',
      videoGroup,
      videoMesh
    }
  },

  toJSON: (entity, component) => {
    return {
      /**
       * An entity with with an attached MediaComponent;if an empty string, then the current entity is assumed
       */
      mediaUUID: component.mediaUUID.value,
      side: component.side.value,
      size: component.size.value,
      fit: component.fit.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.mediaUUID === 'string') component.mediaUUID.set(json.mediaUUID)
    if (typeof json.side === 'number') component.side.set(json.side)
    if (json.size) component.size.set(new Vector2(json.size.x, json.size.y))
    if (json.fit) component.fit.set(json.fit)
  },

  onRemove: (entity, component) => {
    component.videoGroup.value.removeFromParent()
    component.videoMesh.value.material.map?.dispose()
  },

  errors: ['INVALID_MEDIA_UUID', 'MISSING_MEDIA_ELEMENT'],

  reactor: VideoReactor
})

export const SCENE_COMPONENT_VIDEO = 'video'

function VideoReactor({ root }: EntityReactorProps) {
  const entity = root.entity

  const video = useComponent(entity, VideoComponent)
  const mediaUUID = video.mediaUUID.value ?? ''
  const mediaEntity = UUIDComponent.entitiesByUUID[mediaUUID].value ?? entity
  const mediaElement = useOptionalComponent(mediaEntity, MediaElementComponent)

  // update side
  useEffect(() => {
    video.videoMesh.material.side.set(video.side.value)
  }, [video.side])

  // update mesh
  useEffect(() => {
    const videoMesh = video.videoMesh.value
    resizeImageMesh(videoMesh)
    const scale = ObjectFitFunctions.computeContentFitScale(
      videoMesh.scale.x,
      videoMesh.scale.y,
      video.size.width.value,
      video.size.height.value,
      video.fit.value
    )
    videoMesh.scale.multiplyScalar(scale)
    videoMesh.updateMatrix()

    const videoGroup = video.videoGroup.value
    addObjectToGroup(entity, videoGroup)
    return () => removeObjectFromGroup(entity, videoGroup)
  }, [video.size, video.fit, video.videoMesh.material.map])

  // update video texture
  useEffect(() => {
    if (!mediaEntity) return addError(entity, VideoComponent, 'INVALID_MEDIA_UUID')
    if (!mediaElement) return addError(entity, VideoComponent, 'MISSING_MEDIA_ELEMENT')
    const material = video.videoMesh.material.value
    if (material.map) {
      material.map.image = mediaElement.element.value as HTMLVideoElement
    } else {
      material.map = new VideoTexture(mediaElement.element.value as HTMLVideoElement)
    }
    material.needsUpdate = true
    clearErrors(entity, VideoComponent)
  }, [video, mediaEntity, mediaElement])

  return null
}
