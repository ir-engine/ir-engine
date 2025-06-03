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

import { useEffect } from 'react'
import { DirectionalLight } from 'three'

import {
  S,
  defineComponent,
  getMutableComponent,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'

import { T } from '../../../schema/schemaFunctions'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
import { LightTagComponent } from './LightTagComponent'

export const DirectionalLightComponent = defineComponent({
  name: 'DirectionalLightComponent',
  jsonID: 'EE_directional_light',

  schema: S.Object({
    light: S.Type<DirectionalLight>({ serialized: false }),
    color: T.Color(),
    intensity: S.Number({ default: 1 }),
    castShadow: S.Bool({ default: false }),
    shadowBias: S.Number({ default: -0.00001 }),
    shadowRadius: S.Number({ default: 1 }),
    cameraFar: S.Number({ default: 200 })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const directionalLightComponent = useComponent(entity, DirectionalLightComponent)
    const light = useHookstate(() => new DirectionalLight()).value as DirectionalLight

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      getMutableComponent(entity, DirectionalLightComponent).light.set(light)
      setComponent(entity, ObjectComponent, light)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.color.set(directionalLightComponent.color.value)
    }, [directionalLightComponent.color])

    useEffect(() => {
      light.intensity = directionalLightComponent.intensity.value
    }, [directionalLightComponent.intensity])

    useEffect(() => {
      light.shadow.camera.far = directionalLightComponent.cameraFar.value
      light.shadow.camera.updateProjectionMatrix()
    }, [directionalLightComponent.cameraFar])

    useEffect(() => {
      light.shadow.bias = directionalLightComponent.shadowBias.value
    }, [directionalLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = directionalLightComponent.shadowRadius.value
    }, [directionalLightComponent.shadowRadius])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.setScalar(renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    return null
  }
})
