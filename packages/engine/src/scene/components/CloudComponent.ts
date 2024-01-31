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

import { Color, Vector2, Vector3 } from 'three'

import { config } from '@etherealengine/common/src/config'

import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Clouds } from '../classes/Clouds'

export type CloudComponentType = {
  texture: string
  worldScale: Vector3
  dimensions: Vector3
  noiseZoom: Vector3
  noiseOffset: Vector3
  spriteScaleRange: Vector2
  fogColor: Color
  fogRange: Vector2
  clouds?: Clouds
}

export const CloudComponent = defineComponent({
  name: 'CloudComponent',
  jsonID: 'cloud',
  onInit: () => {
    return {
      texture: `${config.client.fileServer}/projects/default-project/assets/cloud.png`,
      worldScale: new Vector3(1000, 150, 1000),
      dimensions: new Vector3(8, 4, 8),
      noiseZoom: new Vector3(7, 11, 7),
      noiseOffset: new Vector3(0, 4000, 3137),
      spriteScaleRange: new Vector2(50, 100),
      fogColor: new Color(0x4584b4),
      fogRange: new Vector2(-100, 3000)
    } as CloudComponentType
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.texture === 'string') component.texture.set(json.texture)
    if (typeof json.worldScale === 'object')
      component.worldScale.set(new Vector3(json.worldScale.x, json.worldScale.y, json.worldScale.z))
    if (typeof json.dimensions === 'object')
      component.dimensions.set(new Vector3(json.dimensions.x, json.dimensions.y, json.dimensions.z))
    if (typeof json.noiseZoom === 'object')
      component.noiseZoom.set(new Vector3(json.noiseZoom.x, json.noiseZoom.y, json.noiseZoom.z))
    if (typeof json.noiseOffset === 'object')
      component.noiseOffset.set(new Vector3(json.noiseOffset.x, json.noiseOffset.y, json.noiseOffset.z))
    if (typeof json.spriteScaleRange === 'object')
      component.spriteScaleRange.set(new Vector2(json.spriteScaleRange.x, json.spriteScaleRange.y))
    if (typeof json.fogColor === 'number') component.fogColor.set(new Color(json.fogColor))
    if (typeof json.fogRange === 'object') component.fogRange.set(new Vector2(json.fogRange.x, json.fogRange.y))
  },
  toJSON(entity, component) {
    return {
      texture: component.texture.value,
      worldScale: component.worldScale.value,
      dimensions: component.dimensions.value,
      noiseZoom: component.noiseZoom.value,
      noiseOffset: component.noiseOffset.value,
      spriteScaleRange: component.spriteScaleRange.value,
      fogColor: component.fogColor.value,
      fogRange: component.fogRange.value
    }
  },
  errors: ['TEXTURE_LOADING_ERROR']
})
