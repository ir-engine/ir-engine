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
import { AmbientLight } from 'three'

import { defineComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useDisposable } from '../../../resources/resourceHooks'
import { T } from '../../../schema/schemaFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LightTagComponent } from './LightTagComponent'

export const AmbientLightComponent = defineComponent({
  name: 'AmbientLightComponent',
  jsonID: 'EE_ambient_light',

  schema: S.Object({
    color: T.Color(0xffffff),
    intensity: S.Number(1)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const ambientLightComponent = useComponent(entity, AmbientLightComponent)
    const [light] = useDisposable(AmbientLight, entity)

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.color.set(ambientLightComponent.color.value)
    }, [ambientLightComponent.color])

    useEffect(() => {
      light.intensity = ambientLightComponent.intensity.value
    }, [ambientLightComponent.intensity])

    return null
  }
})
