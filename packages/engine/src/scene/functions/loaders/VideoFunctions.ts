import { Group, Mesh, MeshStandardMaterial, VideoTexture } from 'three'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, serializeComponent } from '../../../ecs/functions/ComponentFunctions'
import { resizeImageMesh } from '../../components/ImageComponent'
import { MediaElementComponent } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
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

export const updateVideo: ComponentUpdateFunction = (entity: Entity) => {
  if (!hasComponent(entity, Object3DComponent)) addComponent(entity, Object3DComponent, { value: new Group() })
  const group = getComponent(entity, Object3DComponent).value as Mesh<any, MeshStandardMaterial>
  const video = getComponent(entity, VideoComponent)
  const mediaElement = getComponent(entity, MediaElementComponent)
  if (video.mesh.parent !== group) {
    group.add(video.mesh)
    video.mesh.material.map = new VideoTexture(mediaElement.element as HTMLVideoElement)
  }
  resizeImageMesh(video.mesh)
}
