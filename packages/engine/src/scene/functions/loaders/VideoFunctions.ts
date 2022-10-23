import { useEffect } from 'react'
import { VideoTexture } from 'three'

import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  defineComponent,
  serializeComponent,
  useComponent
} from '../../../ecs/functions/ComponentFunctions'
import { ObjectFitFunctions } from '../../../xrui/functions/ObjectFitFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../../components/GroupComponent'
import { resizeImageMesh } from '../../components/ImageComponent'
import { MediaElementComponent } from '../../components/MediaComponent'
import { UUIDComponent } from '../../components/UUIDComponent'
import { VideoComponent } from '../../components/VideoComponent'
import { addError, removeError } from '../ErrorFunctions'

export const deserializeVideo: ComponentDeserializeFunction = (
  entity: Entity,
  data: ReturnType<typeof VideoComponent.toJSON>
) => {
  addComponent(entity, VideoComponent, data)
}

export const serializeVideo = (entity: Entity) => {
  return serializeComponent(entity, VideoComponent)
}

export const VideoReactorComponent = defineComponent({
  name: 'VideoReactor',
  reactor: ({ root }) => {
    const entity = root.entity
    const video = useComponent(entity, VideoComponent)
    if (!video) throw root.stop()

    const mediaUUID = video.mediaUUID.value ?? ''
    const mediaEntity = UUIDComponent.entitiesByUUID[mediaUUID].value ?? entity
    const mediaElement = useComponent(mediaEntity, MediaElementComponent)

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
      if (!mediaEntity) return addError(entity, VideoComponent.name, 'mediaEntity is invalid')
      if (!mediaElement) return addError(entity, VideoComponent.name, 'mediaEntity is missing a media element')
      video.videoMesh.material.map.set(new VideoTexture(mediaElement.element.value as HTMLVideoElement))
      video.videoMesh.material.value.needsUpdate = true
      removeError(entity, VideoComponent.name)
    }, [video, mediaEntity, mediaElement])

    return null
  }
})
