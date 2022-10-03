import { addStateReactor, useState } from '@xrengine/hyperflux'
import { useEffect } from 'react'
import { VideoTexture, Group} from 'three'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, ComponentType, getComponent, serializeComponent, useComponent } from '../../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import { resizeImageMesh } from '../../components/ImageComponent'
import { MediaElementComponent } from '../../components/MediaComponent'
import { VideoComponent } from '../../components/VideoComponent'
import { addError, removeError } from '../ErrorFunctions'

export const deserializeVideo: ComponentDeserializeFunction = (
  entity: Entity,
  data: ReturnType<typeof VideoComponent.toJSON>
) => {
  addComponent(entity, VideoComponent, data)
}

export const serializeVideo: ComponentSerializeFunction = (entity) => {
  return serializeComponent(entity, VideoComponent)
}

export const enterVideo = (videoEntity: Entity) => {

  const world = Engine.instance.currentWorld
  const video = getComponent(entity, VideoComponent)

  addObjectToGroup(entity, video.videoGroup.value)

  let mediaElement : ComponentType<typeof MediaElementComponent>

  const updateMedia = () => {
    if (mediaElement) {
      mediaElement.element.removeEventListener('resize', updateMedia)
    }

    const mediaEntity = video.mediaEntity.value ? world.entityTree.uuidNodeMap.get(video.mediaEntity.value)?.entity : entity  
    if (!mediaEntity) {
      addError(entity, VideoComponent.name, 'mediaEntity is invalid')
      return
    }

    mediaElement = getComponent(mediaEntity, MediaElementComponent)
    if (!mediaElement) {
      addError(entity, VideoComponent.name, 'mediaEntity is missing a media element')
      return
    }

    video.videoMesh.material.map.set( new VideoTexture(mediaElement.element as HTMLVideoElement) )
    video.videoMesh.material.value.needsUpdate = true
    mediaElement.element.addEventListener('resize', updateMedia, { 
      signal: mediaElement.abortController.signal
    })

    removeError(entity, VideoComponent.name)
  }

  video.mediaEntity.subscribe(updateMedia)
  updateMedia()

  
}


export const VideoReactor = (entity: Entity, world) => {

  const entityMap = useState(world.entityTree.uuidNodeMap).value
  const video = useComponent(entity, VideoComponent)
  const mediaEntity = video?.mediaEntity.value ? entityMap.get(video.mediaEntity.value)?.entity : entity 
  const mediaElement = useComponent(mediaEntity, MediaElementComponent)

  useEffect(() => {

    if (!mediaEntity) {
      addError(entity, VideoComponent.name, 'mediaEntity is invalid')
      return
    }
  
    if (!mediaElement) {
      addError(entity, VideoComponent.name, 'mediaEntity is missing a media element')
    }

    video.videoMesh.material.map.set( new VideoTexture(mediaElement.element as HTMLVideoElement) )
    video.videoMesh.material.value.needsUpdate = true
    removeError(entity, VideoComponent.name)
    
  }, [mediaEntity, mediaElement])

}
