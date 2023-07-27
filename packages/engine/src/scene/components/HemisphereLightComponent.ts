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
import { Color, HemisphereLight } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const HemisphereLightComponent = defineComponent({
  name: 'HemisphereLightComponent',
  jsonID: 'hemisphere-light',

  onInit: (entity) => {
    const light = new HemisphereLight()
    addObjectToGroup(entity, light)
    return {
      light,
      skyColor: new Color(),
      groundColor: new Color(),
      intensity: 1
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.skyColor) && json.skyColor.isColor) component.skyColor.set(json.skyColor)
    if (matches.string.test(json.skyColor) || matches.number.test(json.skyColor))
      component.skyColor.value.set(json.skyColor)
    if (matches.object.test(json.groundColor) && json.groundColor.isColor) component.groundColor.set(json.groundColor)
    if (matches.string.test(json.groundColor) || matches.number.test(json.groundColor))
      component.groundColor.value.set(json.groundColor)
    if (matches.number.test(json.intensity)) component.intensity.set(json.intensity)
  },

  toJSON: (entity, component) => {
    return {
      skyColor: component.skyColor.value,
      groundColor: component.groundColor.value,
      intensity: component.intensity.value
    }
  },

  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.light.value)
  },

  reactor: function () {
    const entity = useEntityContext()
    const light = useComponent(entity, HemisphereLightComponent)

    useEffect(() => {
      light.light.value.groundColor.set(light.groundColor.value)
    }, [light.groundColor])

    useEffect(() => {
      light.light.value.color.set(light.skyColor.value)
    }, [light.skyColor])

    useEffect(() => {
      light.light.value.intensity = light.intensity.value
    }, [light.intensity])

    return null
  }
})
