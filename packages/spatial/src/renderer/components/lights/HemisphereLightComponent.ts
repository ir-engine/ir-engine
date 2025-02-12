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
import { HemisphereLight } from 'three'

import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { useMutableState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { LightHelperComponent } from '../../../common/debug/LightHelperComponent'
import { useDisposable } from '../../../resources/resourceHooks'
import { T } from '../../../schema/schemaFunctions'
import { RendererState } from '../../RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LightTagComponent } from './LightTagComponent'

export const HemisphereLightComponent = defineComponent({
  name: 'HemisphereLightComponent',
  jsonID: 'EE_hemisphere_light',

  schema: S.Object({
    skyColor: T.Color(0xffffff),
    groundColor: T.Color(0xffffff),
    intensity: S.Number(1)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const hemisphereLightComponent = useComponent(entity, HemisphereLightComponent)
    const renderState = useMutableState(RendererState)
    const debugEnabled = renderState.nodeHelperVisibility
    const [light] = useDisposable(HemisphereLight, entity)
    const lightHelper = useOptionalComponent(entity, LightHelperComponent)

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.groundColor.set(hemisphereLightComponent.groundColor.value)
    }, [hemisphereLightComponent.groundColor])

    useEffect(() => {
      light.color.set(hemisphereLightComponent.skyColor.value)
      if (lightHelper) lightHelper.color.set(hemisphereLightComponent.skyColor.value)
    }, [hemisphereLightComponent.skyColor])

    useEffect(() => {
      light.intensity = hemisphereLightComponent.intensity.value
    }, [hemisphereLightComponent.intensity])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, LightHelperComponent, { name: 'hemisphere-light-helper', light: light })
      }
      return () => {
        removeComponent(entity, LightHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
