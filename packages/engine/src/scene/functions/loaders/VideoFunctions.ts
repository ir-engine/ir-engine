import { useEffect } from 'react'
import { VideoTexture } from 'three'

import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, serializeComponent, useComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntityReactor, EntityReactorParams } from '../../../ecs/functions/EntityFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
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

export const enterVideo = (entity: Entity) => {
  const video = getComponent(entity, VideoComponent)
  addObjectToGroup(entity, video.videoGroup.value)
  createEntityReactor(entity, VideoReactor)
}

export const VideoReactor = ({ entity, destroyReactor }: EntityReactorParams) => {
  const video = useComponent(entity, VideoComponent)
  const mediaUUID = video?.mediaUUID.value ?? ''
  const mediaEntity = UUIDComponent.entitiesByUUID[mediaUUID].value ?? entity
  const mediaElement = useComponent(mediaEntity, MediaElementComponent)

  useEffect(() => {
    if (!video) destroyReactor()
  }, [video])

  useEffect(() => {
    if (!video) {
      addError(entity, VideoComponent.name, 'video component is missing')
      return
    }

    if (!mediaEntity) {
      addError(entity, VideoComponent.name, 'mediaEntity is invalid')
      return
    }

    if (!mediaElement) {
      addError(entity, VideoComponent.name, 'mediaEntity is missing a media element')
      return
    }

    video.videoMesh.material.map.set(new VideoTexture(mediaElement.element as HTMLVideoElement))
    video.videoMesh.material.value.needsUpdate = true
    removeError(entity, VideoComponent.name)
  }, [video, mediaEntity, mediaElement])
}
