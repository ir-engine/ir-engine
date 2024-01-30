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

import { useEffect } from 'react'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { defineComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { MediaSettingsState } from '@etherealengine/spatial/src/networking/MediaSettingsState'

export const MediaSettingsComponent = defineComponent({
  name: 'MediaSettingsComponent',
  jsonID: 'media-settings',

  onInit(entity): typeof MediaSettingsState._TYPE {
    return typeof MediaSettingsState.initial === 'function'
      ? (MediaSettingsState.initial as any)()
      : JSON.parse(JSON.stringify(MediaSettingsState.initial))
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.immersiveMedia === 'boolean') component.immersiveMedia.set(json.immersiveMedia)
    if (typeof json.refDistance === 'number') component.refDistance.set(json.refDistance)
    if (typeof json.rolloffFactor === 'number') component.rolloffFactor.set(json.rolloffFactor)
    if (typeof json.maxDistance === 'number') component.maxDistance.set(json.maxDistance)
    if (typeof json.distanceModel === 'string') component.distanceModel.set(json.distanceModel)
    if (typeof json.coneInnerAngle === 'number') component.coneInnerAngle.set(json.coneInnerAngle)
    if (typeof json.coneOuterAngle === 'number') component.coneOuterAngle.set(json.coneOuterAngle)
    if (typeof json.coneOuterGain === 'number') component.coneOuterGain.set(json.coneOuterGain)
  },

  toJSON: (entity, component) => {
    return {
      immersiveMedia: component.immersiveMedia.value,
      refDistance: component.refDistance.value,
      rolloffFactor: component.rolloffFactor.value,
      maxDistance: component.maxDistance.value,
      distanceModel: component.distanceModel.value,
      coneInnerAngle: component.coneInnerAngle.value,
      coneOuterAngle: component.coneOuterAngle.value,
      coneOuterGain: component.coneOuterGain.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, MediaSettingsComponent)

    for (const prop of Object.keys(getState(MediaSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== getState(MediaSettingsState)[prop])
          getMutableState(MediaSettingsState)[prop].set(component[prop].value)
      }, [component[prop]])
    }

    return null
  }
})
