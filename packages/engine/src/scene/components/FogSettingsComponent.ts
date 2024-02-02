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
import { FogSettingState } from '../FogState'

export const FogSettingsComponent = defineComponent({
  name: 'FogSettingsComponent',
  jsonID: 'fog',

  onInit(entity): typeof FogSettingState._TYPE {
    return typeof FogSettingState.initial === 'function'
      ? (FogSettingState.initial as any)()
      : JSON.parse(JSON.stringify(FogSettingState.initial))
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.type === 'string') component.type.set(json.type)
    if (typeof json.color === 'string') component.color.set(json.color)
    if (typeof json.density === 'number') component.density.set(json.density)
    if (typeof json.near === 'number') component.near.set(json.near)
    if (typeof json.far === 'number') component.far.set(json.far)
    if (typeof json.timeScale === 'number') component.timeScale.set(json.timeScale)
    if (typeof json.height === 'number') component.height.set(json.height)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value,
      color: component.color.value,
      density: component.density.value,
      near: component.near.value,
      far: component.far.value,
      timeScale: component.timeScale.value,
      height: component.height.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, FogSettingsComponent)

    for (const prop of Object.keys(getState(FogSettingState))) {
      useEffect(() => {
        if (component[prop].value !== getState(FogSettingState)[prop])
          getMutableState(FogSettingState)[prop].set(component[prop].value)
      }, [component[prop]])
    }

    return null
  }
})
