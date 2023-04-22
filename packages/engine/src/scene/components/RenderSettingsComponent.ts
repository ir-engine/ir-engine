import { useEffect } from 'react'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { RenderSettingsState } from '../../renderer/WebGLRendererSystem'

export const RenderSettingsComponent = defineComponent({
  name: 'RenderSettingsComponent',
  jsonID: 'render-settings',

  onInit(entity) {
    return JSON.parse(JSON.stringify(getState(RenderSettingsState))) as typeof RenderSettingsState._TYPE
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.csm === 'boolean') component.csm.set(json.csm)
    if (typeof json.toneMapping === 'number') component.toneMapping.set(json.toneMapping)
    if (typeof json.toneMappingExposure === 'number') component.toneMappingExposure.set(json.toneMappingExposure)
    if (typeof json.shadowMapType === 'number') component.shadowMapType.set(json.shadowMapType)
  },

  toJSON: (entity, component) => {
    return {
      csm: component.csm.value,
      toneMapping: component.toneMapping.value,
      toneMappingExposure: component.toneMappingExposure.value,
      shadowMapType: component.shadowMapType.value
    }
  },

  reactor: ({ root }) => {
    const component = useComponent(root.entity, RenderSettingsComponent)

    for (const prop of Object.keys(getState(RenderSettingsState))) {
      useEffect(() => {
        if (prop! in component) return
        if (component[prop].value !== getState(RenderSettingsState)[prop].value)
          getMutableState(RenderSettingsState)[prop].set(component[prop].value)
      }, component[prop])
    }

    return null
  }
})
