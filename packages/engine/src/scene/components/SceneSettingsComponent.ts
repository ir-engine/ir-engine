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

import { EntityUUID } from '@ir-engine/ecs'
import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'

export const DefaultKillHeight = -10

export const SceneSettingsComponent = defineComponent({
  name: 'SceneSettingsComponent',
  jsonID: 'EE_scene_settings',

  onInit() {
    return {
      thumbnailURL: '',
      loadingScreenURL: '',
      primaryColor: '#000000',
      backgroundColor: '#FFFFFF',
      alternativeColor: '#000000',
      sceneKillHeight: DefaultKillHeight,
      spectateEntity: null as null | EntityUUID
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.thumbnailURL === 'string') component.thumbnailURL.set(json.thumbnailURL)
    if (typeof json.loadingScreenURL === 'string') component.loadingScreenURL.set(json.loadingScreenURL)
    if (typeof json.primaryColor === 'string') component.primaryColor.set(json.primaryColor)
    if (typeof json.backgroundColor === 'string') component.backgroundColor.set(json.backgroundColor)
    if (typeof json.alternativeColor === 'string') component.alternativeColor.set(json.alternativeColor)
    if (typeof json.sceneKillHeight === 'number') component.sceneKillHeight.set(json.sceneKillHeight)
    if (typeof json.spectateEntity === 'string') component.spectateEntity.set(json.spectateEntity)
  },

  toJSON: (component) => {
    return {
      thumbnailURL: component.thumbnailURL,
      loadingScreenURL: component.loadingScreenURL,
      primaryColor: component.primaryColor,
      backgroundColor: component.backgroundColor,
      alternativeColor: component.alternativeColor,
      sceneKillHeight: component.sceneKillHeight,
      spectateEntity: component.spectateEntity
    }
  }
})
