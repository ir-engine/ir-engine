/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getContentType } from '@ir-engine/common/src/utils/getContentType'
import { UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { PositionalAudioComponent } from '@ir-engine/engine/src/audio/components/PositionalAudioComponent'
import { ImageComponent } from '@ir-engine/engine/src/scene/components/ImageComponent'
import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { ModelComponent } from '@ir-engine/engine/src/scene/components/ModelComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { VolumetricComponent } from '@ir-engine/engine/src/scene/components/VolumetricComponent'

import { addEntityToScene } from './entityHelper'

export async function addMediaComponent(url: string, parent = UndefinedEntity, before = UndefinedEntity) {
  const contentType = (await getContentType(url)) || ''
  const { hostname } = new URL(url)
  let newEntity = UndefinedEntity
  if (contentType.startsWith('model/')) {
    newEntity = addEntityToScene([{ name: ModelComponent.jsonID, props: { src: url } }], parent!, before)
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    newEntity = addEntityToScene(
      [{ name: VideoComponent.jsonID }, { name: MediaComponent.jsonID, props: { resources: [url] } }],
      parent!,
      before
    )
  } else if (contentType.startsWith('image/')) {
    newEntity = addEntityToScene([{ name: ImageComponent.jsonID, props: { source: url } }], parent!, before)
  } else if (contentType.startsWith('audio/')) {
    newEntity = addEntityToScene(
      [{ name: PositionalAudioComponent.jsonID }, { name: MediaComponent.jsonID, props: { resources: [url] } }],
      parent!,
      before
    )
  } else if (url.includes('.uvol')) {
    newEntity = addEntityToScene(
      [{ name: VolumetricComponent.jsonID }, { name: MediaComponent.jsonID, props: { resources: [url] } }],
      parent!,
      before
    )
  }
  return newEntity
}
