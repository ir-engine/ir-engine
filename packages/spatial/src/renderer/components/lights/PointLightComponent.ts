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
import { PointLight, PointLightHelper } from 'three'

import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { NO_PROXY, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useHelperEntity } from '../../../common/debug/useHelperEntity'
import { useDisposable } from '../../../resources/resourceHooks'
import { T } from '../../../schema/schemaFunctions'
import { isMobileXRHeadset } from '../../../xr/XRState'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

export const PointLightComponent = defineComponent({
  name: 'PointLightComponent',
  jsonID: 'EE_point_light',

  schema: S.Object({
    color: T.Color(0xffffff),
    intensity: S.Number(1),
    range: S.Number(0),
    decay: S.Number(2),
    castShadow: S.Bool(false),
    shadowBias: S.Number(0.5),
    shadowRadius: S.Number(1),
    helperEntity: S.Entity()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const debugEnabled = renderState.nodeHelperVisibility
    const pointLightComponent = useComponent(entity, PointLightComponent)
    const [light] = useDisposable(PointLight, entity)
    const helperEntity = useHelperEntity(entity, () => new PointLightHelper(light), debugEnabled.value)
    const helper = useOptionalComponent(helperEntity, ObjectComponent)?.get(NO_PROXY) as PointLightHelper | undefined

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      if (isMobileXRHeadset) return
      setComponent(entity, ObjectComponent, light)
      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.color.set(pointLightComponent.color.value)
      if (helper) helper.color = pointLightComponent.color.value
    }, [!!helper, pointLightComponent.color])

    useEffect(() => {
      light.intensity = pointLightComponent.intensity.value
    }, [pointLightComponent.intensity])

    useEffect(() => {
      light.distance = pointLightComponent.range.value
    }, [pointLightComponent.range])

    useEffect(() => {
      light.decay = pointLightComponent.decay.value
    }, [pointLightComponent.decay])

    useEffect(() => {
      light.castShadow = pointLightComponent.castShadow.value
    }, [pointLightComponent.castShadow])

    useEffect(() => {
      light.shadow.bias = pointLightComponent.shadowBias.value
    }, [pointLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = pointLightComponent.shadowRadius.value
    }, [pointLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.set(renderState.shadowMapResolution.value, renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    return null
  }
})
