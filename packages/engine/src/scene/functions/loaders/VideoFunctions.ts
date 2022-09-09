import { VideoTexture } from 'three'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, serializeComponent } from '../../../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../../components/GroupComponent'
import { resizeImageMesh } from '../../components/ImageComponent'
import { MediaElementComponent } from '../../components/MediaComponent'
import { VideoComponent } from '../../components/VideoComponent'

export const deserializeVideo: ComponentDeserializeFunction = (
  entity: Entity,
  data: ReturnType<typeof VideoComponent.toJSON>
) => {
  addComponent(entity, VideoComponent, data)
}

export const serializeVideo: ComponentSerializeFunction = (entity) => {
  return serializeComponent(entity, VideoComponent)
}

export const enterVideo = (entity: Entity) => {
  const video = getComponent(entity, VideoComponent)
  const mediaElement = getComponent(entity, MediaElementComponent)
  addObjectToGroup(entity, video.mesh)
  video.mesh.material.map = new VideoTexture(mediaElement.element as HTMLVideoElement)
  video.mesh.material.needsUpdate = true
  mediaElement.element.addEventListener(
    'resize',
    () => {
      resizeImageMesh(video.mesh)
    },
    { signal: mediaElement.abortController.signal }
  )
  resizeImageMesh(video.mesh)
}
