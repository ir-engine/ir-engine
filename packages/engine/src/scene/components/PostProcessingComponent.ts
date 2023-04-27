import { useEffect } from 'react'

import { getMutableState, getState } from '@etherealengine/hyperflux'

import { defineComponent, getComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { PostProcessingSettingsState } from '../../renderer/WebGLRendererSystem'

export const PostProcessingComponent = defineComponent({
  name: 'PostProcessingComponent',
  jsonID: 'postprocessing',

  onInit(entity) {
    return JSON.parse(JSON.stringify(getState(PostProcessingSettingsState))) as typeof PostProcessingSettingsState._TYPE
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.enabled) component.enabled.set(json.enabled)
    if (json.effects) component.effects.set(json.effects)
  },

  toJSON: (entity, component) => {
    return {
      enabled: component.enabled.value,
      effects: component.effects.value
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, PostProcessingComponent)

    for (const prop of Object.keys(getState(PostProcessingSettingsState))) {
      useEffect(() => {
        if (component[prop].value !== getState(PostProcessingSettingsState)[prop])
          getMutableState(PostProcessingSettingsState)[prop].set(
            JSON.parse(JSON.stringify(getComponent(entity, PostProcessingComponent)[prop]))
          )
      }, [component[prop]])
    }

    return null
  }
})
