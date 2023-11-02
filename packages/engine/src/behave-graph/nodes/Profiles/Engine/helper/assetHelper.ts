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

import { getContentType } from '@etherealengine/common/src/utils/getContentType'
import { PositionalAudioComponent } from '../../../../../audio/components/PositionalAudioComponent'
import { Entity } from '../../../../../ecs/classes/Entity'
import { ImageComponent } from '../../../../../scene/components/ImageComponent'
import { MediaComponent } from '../../../../../scene/components/MediaComponent'
import { ModelComponent } from '../../../../../scene/components/ModelComponent'
import { VideoComponent } from '../../../../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../../../../scene/components/VolumetricComponent'
import { addEntityToScene } from './entityHelper'

export async function addMediaComponent(url: string, parent?: Entity | null, before?: Entity | null) {
  const contentType = (await getContentType(url)) || ''
  console.log('debug1 the contentType was', contentType, 'and the url was', url)
  const { hostname } = new URL(url)

  if (contentType.startsWith('model/')) {
    addEntityToScene([{ name: ModelComponent.jsonID, props: { src: url } }], parent!, before)
  } else if (contentType.startsWith('video/') || hostname.includes('twitch.tv') || hostname.includes('youtube.com')) {
    addEntityToScene(
      [{ name: VideoComponent.jsonID }, { name: MediaComponent.jsonID, props: { resources: [url] } }],
      parent!,
      before
    )
  } else if (contentType.startsWith('image/')) {
    addEntityToScene([{ name: ImageComponent.jsonID, props: { source: url } }], parent!, before)
  } else if (contentType.startsWith('audio/')) {
    addEntityToScene(
      [{ name: PositionalAudioComponent.jsonID }, { name: MediaComponent.jsonID, props: { resources: [url] } }],
      parent!,
      before
    )
  } else if (url.includes('.uvol')) {
    addEntityToScene(
      [{ name: VolumetricComponent.jsonID }, { name: MediaComponent.jsonID, props: { resources: [url] } }],
      parent!,
      before
    )
  }
}
