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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useComponent, useOptionalComponent } from '@ir-engine/ecs'
import { getMutableState, getState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { HemisphereLightComponent } from '@ir-engine/spatial/src/SpatialModule'
import { useEffect } from 'react'
import { HemisphereLight, HemisphereLightHelper } from 'three'
import { ActiveHelperReactorProps, ActiveHelperRegistryState } from './HelperRegistry'

const helperKey = HemisphereLightComponent.jsonID

export const HemiSphereLightHelperReactor: React.FC<ActiveHelperReactorProps> = (props: {
  entity
  selected
  hovered
}) => {
  const { entity, selected, hovered } = props
  const helper = getState(ActiveHelperRegistryState)
  const hemisphereLightComponent = useComponent(entity, helper[helperKey].component as typeof HemisphereLightComponent)

  const debugEnabled = selected || hovered
  const light = useHookstate(() => new HemisphereLight()).get(NO_PROXY) as HemisphereLight
  const helperEntity = useHelperEntity(entity, () => new HemisphereLightHelper(light, 10), debugEnabled)
  const helperObject = useOptionalComponent(helperEntity, ObjectComponent)?.get(NO_PROXY) as
    | HemisphereLightHelper
    | undefined

  useEffect(() => {
    light.color.set(hemisphereLightComponent.skyColor.value)
    if (helperObject) helperObject.color = hemisphereLightComponent.skyColor.value
  }, [!!helperObject, hemisphereLightComponent.skyColor])

  return null
}

export const HemisphereLightaddtoHelperRegistry = (icon) => {
  // registers the effect

  getMutableState(ActiveHelperRegistryState).merge({
    [helperKey]: {
      reactor: HemiSphereLightHelperReactor,
      icon: icon,
      component: HemisphereLightComponent
    }
  })
}
