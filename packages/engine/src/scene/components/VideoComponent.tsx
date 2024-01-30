/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, Side, Texture, Vector2 } from 'three'

import { defineState } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { createPriorityQueue } from '@etherealengine/spatial/src/common/functions/PriorityQueue'
import { isMobile } from '@etherealengine/spatial/src/common/functions/isMobile'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent, setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { isMobileXRHeadset } from '@etherealengine/spatial/src/xr/XRState'
import { ContentFitType, ObjectFitFunctions } from '@etherealengine/spatial/src/xrui/functions/ObjectFitFunctions'
import { clearErrors } from '../functions/ErrorFunctions'
import { PLANE_GEO, resizeImageMesh } from './ImageComponent'
import { MediaElementComponent } from './MediaComponent'

export const VideoTexturePriorityQueueState = defineState({
  name: 'VideoTexturePriorityQueueState',
  initial: () => {
    const accumulationBudget = isMobileXRHeadset || isMobile ? 1 : 3
    return {
      queue: createPriorityQueue({
        accumulationBudget
      })
    }
  }
})

class VideoTexturePriorityQueue extends Texture {
  isVideoTexture = true
  constructor(video) {
    super(video)
    this.minFilter = LinearFilter
    this.magFilter = LinearFilter
    this.generateMipmaps = false
  }
  update() {}
}

export const VideoComponent = defineComponent({
  name: 'EE_video',
  jsonID: 'video',

  onInit: (entity) => {
    const videoMesh = new Mesh(PLANE_GEO.clone(), new MeshBasicMaterial())
    videoMesh.name = `video-group-${entity}`
    return {
      side: DoubleSide as Side,
      size: new Vector2(1, 1),
      fit: 'contain' as ContentFitType,
      mediaUUID: '' as EntityUUID,
      // internal
      videoMesh,
      videoEntity: UndefinedEntity,
      texture: null as VideoTexturePriorityQueue | null
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
    if (typeof json.size === 'object') component.size.set(new Vector2(json.size.x, json.size.y))
    if (typeof json.fit === 'string') component.fit.set(json.fit)
  },

  onRemove: (entity, component) => {
    if (VideoComponent.uniqueVideoEntities.includes(entity)) {
      VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
    }
  },

  errors: ['INVALID_MEDIA_UUID', 'MISSING_MEDIA_ELEMENT'],

  uniqueVideoEntities: [] as Entity[],

  reactor: VideoReactor
})

function VideoReactor() {
  const entity = useEntityContext()
  const video = useComponent(entity, VideoComponent)
  const visible = useOptionalComponent(entity, VisibleComponent)
  const mediaUUID = video.mediaUUID.value
  const mediaEntity = UUIDComponent.getEntityByUUID(mediaUUID) || entity

  console.log({ mediaEntity })

  useEffect(() => {
    const videoEntity = createEntity()
    addObjectToGroup(videoEntity, video.videoMesh.value)
    setComponent(videoEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(videoEntity, NameComponent, video.videoMesh.value.name)
    video.videoEntity.set(videoEntity)
    return () => {
      removeEntity(videoEntity)
      video.videoEntity.set(UndefinedEntity)
    }
  }, [])

  useEffect(() => {
    if (!video.videoEntity.value) return
    setVisibleComponent(video.videoEntity.value, !!visible)
  }, [visible, video.videoEntity])

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
    videoMesh.scale.setScalar(scale)
  }, [video.size, video.fit, video.texture])

  useEffect(() => {
    video.videoMesh.value.material.map = video.texture.value
    video.videoMesh.value.material.needsUpdate = true
  }, [video.texture])

  return <VideoMediaSourceReactor mediaEntity={mediaEntity} key={mediaEntity} />
}

const VideoMediaSourceReactor = (props: { mediaEntity }) => {
  const entity = useEntityContext()
  const video = useComponent(entity, VideoComponent)

  const { mediaEntity } = props

  const mediaElement = useOptionalComponent(mediaEntity, MediaElementComponent)

  // update video texture
  useEffect(() => {
    if (!mediaEntity || !mediaElement) return
    const sourceVideoComponent = getComponent(mediaEntity, VideoComponent)
    const sourceTexture = sourceVideoComponent.texture
    if (video.texture.value) {
      video.texture.value.image = mediaElement.element.value as HTMLVideoElement
      clearErrors(entity, VideoComponent)
    } else {
      if (sourceTexture) {
        video.videoMesh.value.material = sourceVideoComponent.videoMesh.material
        clearErrors(entity, VideoComponent)
      } else {
        video.texture.set(new VideoTexturePriorityQueue(mediaElement.element.value as HTMLVideoElement))
        VideoComponent.uniqueVideoEntities.push(mediaEntity)
        clearErrors(entity, VideoComponent)
        return () => {
          if (VideoComponent.uniqueVideoEntities.includes(entity)) {
            VideoComponent.uniqueVideoEntities.splice(VideoComponent.uniqueVideoEntities.indexOf(entity), 1)
          }
        }
      }
    }
  }, [video, mediaEntity, mediaElement])

  return null
}
