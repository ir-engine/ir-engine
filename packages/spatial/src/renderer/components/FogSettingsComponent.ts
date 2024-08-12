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
import { Fog, FogExp2 } from 'three'

import {
  defineComponent,
  getOptionalComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { FogComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'

import { FogShaders } from '../FogSystem'
import { initBrownianMotionFogShader, initHeightFogShader, removeFogShader } from './FogShaders'

export enum FogType {
  Disabled = 'disabled',
  Linear = 'linear',
  Exponential = 'exponential',
  Brownian = 'brownian',
  Height = 'height'
}

export const FogSettingsComponent = defineComponent({
  name: 'FogSettingsComponent',
  jsonID: 'EE_fog',

  onInit(entity) {
    return {
      type: FogType.Disabled as FogType,
      color: '#FFFFFF',
      density: 0.005,
      near: 1,
      far: 1000,
      timeScale: 1,
      height: 0.05
    }
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
    const fog = useComponent(entity, FogSettingsComponent)

    useEffect(() => {
      const fogData = fog.value
      switch (fogData.type) {
        case FogType.Linear:
          setComponent(entity, FogComponent, new Fog(fogData.color, fogData.near, fogData.far))
          removeFogShader()
          break

        case FogType.Exponential:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          removeFogShader()
          break

        case FogType.Brownian:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          initBrownianMotionFogShader()
          break

        case FogType.Height:
          setComponent(entity, FogComponent, new FogExp2(fogData.color, fogData.density))
          initHeightFogShader()
          break

        default:
          removeComponent(entity, FogComponent)
          removeFogShader()
          break
      }
    }, [fog.type])

    useEffect(() => {
      getOptionalComponent(entity, FogComponent)?.color.set(fog.color.value)
    }, [fog.color])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && fog.type.value !== FogType.Linear) (fogComponent as FogExp2).density = fog.density.value
    }, [fog.density])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).near = fog.near.value
    }, [fog.near])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent) (fogComponent as Fog).far = fog.far.value
    }, [fog.far])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && (fog.type.value === FogType.Brownian || fog.type.value === FogType.Height))
        for (const s of FogShaders) s.uniforms.heightFactor.value = fog.height.value
    }, [fog.height])

    useEffect(() => {
      const fogComponent = getOptionalComponent(entity, FogComponent)
      if (fogComponent && fog.type.value === FogType.Brownian)
        for (const s of FogShaders) {
          s.uniforms.fogTimeScale.value = fog.timeScale.value
        }
    }, [fog.timeScale])

    return null
  }
})
