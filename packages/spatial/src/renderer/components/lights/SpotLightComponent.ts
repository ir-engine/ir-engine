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
import { Color, SpotLight } from 'three'

import { S, useEntityContext } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useHookstate, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'

import { T } from '../../../schema/schemaFunctions'
import { isMobileXRHeadset } from '../../../xr/XRState'
import { RendererState } from '../../RendererState'
import { ObjectComponent } from '../ObjectComponent'
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
    color: T.Color(0xffffff),
    intensity: S.Number({ default: 10 }),
    range: S.Number({ default: 0 }),
    decay: S.Number({ default: 2 }),
    angle: S.Number({ default: Math.PI / 3 }),
    penumbra: S.Number({ default: 1 }),
    castShadow: S.Bool({ default: false }),
    shadowBias: S.Number({ default: 0 }),
    shadowRadius: S.Number({ default: 1 })
  }),

  reactor: function () {
    const entity = useEntityContext()
    const renderState = useMutableState(RendererState)

    const spotLightComponent = useComponent(entity, SpotLightComponent)
    const light = useHookstate(() => new SpotLight()).value as SpotLight

    useImmediateEffect(() => {
      setComponent(entity, LightTagComponent)
      if (isMobileXRHeadset) return
      light.target.position.set(1, 0, 0)
      light.target.name = 'light-target'
      setComponent(entity, ObjectComponent, light)

      return () => {
        removeComponent(entity, ObjectComponent)
      }
    }, [])

    useEffect(() => {
      light.intensity = spotLightComponent.intensity
    }, [spotLightComponent.intensity])

    useEffect(() => {
      light.distance = spotLightComponent.range
    }, [spotLightComponent.range])

    useEffect(() => {
      light.decay = spotLightComponent.decay
    }, [spotLightComponent.decay])

    useEffect(() => {
      light.angle = spotLightComponent.angle
    }, [spotLightComponent.angle])

    useEffect(() => {
      light.penumbra = spotLightComponent.penumbra
    }, [spotLightComponent.penumbra])

    useEffect(() => {
      light.shadow.bias = spotLightComponent.shadowBias
    }, [spotLightComponent.shadowBias])

    useEffect(() => {
      light.shadow.radius = spotLightComponent.shadowRadius
    }, [spotLightComponent.shadowRadius])

    useEffect(() => {
      light.castShadow = spotLightComponent.castShadow
    }, [spotLightComponent.castShadow])

    useEffect(() => {
      light.color = new Color(spotLightComponent.color.value)
    }, [spotLightComponent.color.value])

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
