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

import { defineComponent, removeComponent, setComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { DirectionalLightComponent, PointLightComponent, SpotLightComponent } from '@etherealengine/spatial'
import { useEffect } from 'react'
import { Color } from 'three'
import { getParserOptions } from './GLTFState'

export type KHRPunctualLight = {
  color?: [number, number, number]
  intensity?: number
  range?: number
  type: 'directional' | 'point' | 'spot'
  spot?: {
    innerConeAngle?: number
    outerConeAngle?: number
  }
}

export const KHRLightsPunctualComponent = defineComponent({
  name: 'KHRLightsPunctualComponent',
  jsonID: 'KHR_lights_punctual',

  onInit(entity) {
    return {} as {
      light?: number
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.light === 'number') component.light.set(json.light)
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, KHRLightsPunctualComponent)

    const options = getParserOptions(entity)
    const json = options.document
    const extensions: {
      lights?: KHRPunctualLight[]
    } = (json.extensions && json.extensions[KHRLightsPunctualComponent.jsonID]) || {}
    const lightDefs = extensions.lights
    const lightDef = lightDefs && component.light.value ? lightDefs[component.light.value] : undefined

    useEffect(() => {
      return () => {
        removeComponent(entity, DirectionalLightComponent)
        removeComponent(entity, SpotLightComponent)
        removeComponent(entity, PointLightComponent)
      }
    }, [lightDef?.type])

    useEffect(() => {
      if (!lightDef) return

      if (lightDef.type !== 'directional') return

      const color = lightDef.color
        ? new Color().setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2])
        : undefined
      const intensity = typeof lightDef.intensity === 'number' ? lightDef.intensity : undefined

      setComponent(entity, DirectionalLightComponent, {
        color,
        intensity
      })
    }, [lightDef])

    useEffect(() => {
      if (!lightDef) return

      if (lightDef.type !== 'spot') return

      const color = lightDef.color
        ? new Color().setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2])
        : undefined

      const intensity = typeof lightDef.intensity === 'number' ? lightDef.intensity : undefined
      const range = typeof lightDef.range === 'number' ? lightDef.range : undefined
      const innerConeAngle = typeof lightDef.spot?.innerConeAngle === 'number' ? lightDef.spot.innerConeAngle : 0
      const outerConeAngle =
        typeof lightDef.spot?.outerConeAngle === 'number' ? lightDef.spot.outerConeAngle : Math.PI / 4.0

      const penumbra = 1.0 - innerConeAngle / outerConeAngle
      const angle = outerConeAngle

      setComponent(entity, SpotLightComponent, {
        color,
        intensity,
        decay: 2,
        range,
        angle,
        penumbra
      })
    }, [lightDef])

    useEffect(() => {
      if (!lightDef) return

      if (lightDef.type !== 'point') return

      const color = lightDef.color
        ? new Color().setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2])
        : undefined
      const intensity = typeof lightDef.intensity === 'number' ? lightDef.intensity : undefined
      const range = typeof lightDef.range === 'number' ? lightDef.range : undefined

      setComponent(entity, PointLightComponent, {
        color,
        intensity,
        decay: 2,
        range
      })
    }, [lightDef])

    return null
  }
})
