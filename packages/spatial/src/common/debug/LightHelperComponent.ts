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

import { useEffect } from 'react'
import {
  Camera,
  ColorRepresentation,
  DirectionalLight,
  DirectionalLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  Light,
  LightShadow,
  PointLightHelper,
  SpotLight,
  SpotLightHelper
} from 'three'

import { defineComponent, Entity, useComponent, useEntityContext } from '@ir-engine/ecs'
import { matchesColor } from '@ir-engine/spatial/src/common/functions/MatchesUtils'

import { useDisposable } from '../../resources/resourceHooks'
import { useHelperEntity } from './DebugComponentUtils'

const getLightHelperType = (light: Light) => {
  if ((light as DirectionalLight).isDirectionalLight) return DirectionalLightHelper
  else if ((light as SpotLight).isSpotLight) return SpotLightHelper
  else if ((light as HemisphereLight).isHemisphereLight) return HemisphereLightHelper
  else return PointLightHelper
}

export const LightHelperComponent = defineComponent({
  name: 'LightHelperComponent',

  onInit: (entity) => {
    return {
      name: 'light-helper',
      light: undefined! as Light,
      size: 1,
      color: undefined as undefined | ColorRepresentation,
      entity: undefined as undefined | Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (!json.light || !json.light.isLight) throw new Error('LightHelperComponent: Valid Light required')
    component.light.set(json.light)
    if (typeof json.name === 'string') component.name.set(json.name)
    if (typeof json.size === 'number') component.size.set(json.size)
    if (matchesColor.test(json.color)) component.color.set(json.color)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, LightHelperComponent)
    const light = component.light.value as Light<LightShadow<Camera>>
    const [helper] = useDisposable(getLightHelperType(light), entity, light, component.size.value)
    useHelperEntity(entity, component, helper)
    helper.update()

    useEffect(() => {
      helper.color = component.color.value
      helper.update()
    }, [component.color])

    return null
  }
})
