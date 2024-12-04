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
import { SpotLight } from 'three'

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
import { isMobileXRHeadset } from '../../../xr/XRState'
import { RendererState } from '../../RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../GroupComponent'
import { LightTagComponent } from './LightTagComponent'

// const ringGeom = new TorusGeometry(0.1, 0.025, 8, 12)
// const coneGeom = new ConeGeometry(0.25, 0.5, 8, 1, true)
// coneGeom.translate(0, -0.25, 0)
// coneGeom.rotateX(-Math.PI / 2)
// const geom = mergeBufferGeometries([ringGeom, coneGeom])!
// const helperMaterial = new MeshBasicMaterial({ fog: false, transparent: true, opacity: 0.5, side: DoubleSide })

export const SpotLightComponent = defineComponent({
  name: 'SpotLightComponent',
  jsonID: 'EE_spot_light',

  schema: S.Object({
    color: S.Color(0xffffff),
    intensity: S.Number(10),
    range: S.Number(0),
    decay: S.Number(2),
    angle: S.Number(Math.PI / 3),
    penumbra: S.Number(1),
    castShadow: S.Bool(false),
    shadowBias: S.Number(0.00001),
    shadowRadius: S.Number(1)
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)
    const debugEnabled = renderState.nodeHelperVisibility
    const spotLightComponent = useComponent(entity, SpotLightComponent)
    const [light] = useDisposable(SpotLight, entity)
    const lightHelper = useOptionalComponent(entity, LightHelperComponent)

    useEffect(() => {
      setComponent(entity, LightTagComponent)
      if (isMobileXRHeadset) return
      light.target.position.set(1, 0, 0)
      light.target.name = 'light-target'
      addObjectToGroup(entity, light)
      return () => {
        removeObjectFromGroup(entity, light)
      }
    }, [])

    useEffect(() => {
      light.color.set(spotLightComponent.color.value)
      if (lightHelper) lightHelper.color.set(spotLightComponent.color.value)
    }, [spotLightComponent.color, lightHelper])

    useEffect(() => {
      light.intensity = spotLightComponent.intensity.value
    }, [spotLightComponent.intensity])

    useEffect(() => {
      light.distance = spotLightComponent.range.value
    }, [spotLightComponent.range])

    useEffect(() => {
      light.decay = spotLightComponent.decay.value
    }, [spotLightComponent.decay])

    useEffect(() => {
      light.angle = spotLightComponent.angle.value
    }, [spotLightComponent.angle])

    useEffect(() => {
      light.penumbra = spotLightComponent.penumbra.value
    }, [spotLightComponent.penumbra])

    useEffect(() => {
      light.shadow.bias = spotLightComponent.shadowBias.value
    }, [spotLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = spotLightComponent.shadowRadius.value
    }, [spotLightComponent.shadowRadius])

    useEffect(() => {
      light.castShadow = spotLightComponent.castShadow.value
    }, [spotLightComponent.castShadow])

    useEffect(() => {
      if (light.shadow.mapSize.x !== renderState.shadowMapResolution.value) {
        light.shadow.mapSize.set(renderState.shadowMapResolution.value, renderState.shadowMapResolution.value)
        light.shadow.map?.dispose()
        light.shadow.map = null as any
        light.shadow.camera.updateProjectionMatrix()
        light.shadow.needsUpdate = true
      }
    }, [renderState.shadowMapResolution])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, LightHelperComponent, { name: 'spot-light-helper', light: light })
      }
      return () => {
        removeComponent(entity, LightHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
