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

import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'

export const SceneSettingsComponent = defineComponent({
  name: 'SceneSettingsComponent',
  jsonID: 'scene-settings',

  onInit() {
    return {
      thumbnailURL: '',
      loadingScreenURL: '',
      primaryColor: '#000000',
      backgroundColor: '#FFFFFF',
      alternativeColor: '#000000'
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.thumbnailURL === 'string') component.thumbnailURL.set(json.thumbnailURL)
    if (typeof json.loadingScreenURL === 'string') component.loadingScreenURL.set(json.loadingScreenURL)
    if (typeof json.primaryColor === 'string') component.primaryColor.set(json.primaryColor)
    if (typeof json.backgroundColor === 'string') component.backgroundColor.set(json.backgroundColor)
    if (typeof json.alternativeColor === 'string') component.alternativeColor.set(json.alternativeColor)
  },

  toJSON: (entity, component) => {
    return {
      thumbnailURL: component.thumbnailURL.value,
      loadingScreenURL: component.loadingScreenURL.value,
      primaryColor: component.primaryColor.value,
      backgroundColor: component.backgroundColor.value,
      alternativeColor: component.alternativeColor.value
    }
  }
})
