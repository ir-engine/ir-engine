import { useEffect } from 'react'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { FogSettingState } from '../systems/FogSystem'

export const FogSettingsComponent = defineComponent({
  name: 'FogSettingsComponent',
  jsonID: 'fog',

  onInit(entity) {
    return JSON.parse(JSON.stringify(getState(FogSettingState))) as typeof FogSettingState._TYPE
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.type === 'number') component.type.set(json.type)
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

  reactor: ({ root }) => {
    const component = useComponent(root.entity, FogSettingsComponent)

    for (const prop of Object.keys(getState(FogSettingState))) {
      useEffect(() => {
        if (component[prop].value !== getState(FogSettingState)[prop])
          getMutableState(FogSettingState)[prop].set(component[prop].value)
      }, [component[prop]])
    }

    return null
  }
})
