import { useEffect } from 'react'
import { AmbientLight, Color } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const AmbientLightComponent = defineComponent({
  name: 'AmbientLightComponent',

  onInit: (entity) => {
    const light = new AmbientLight()
    addObjectToGroup(entity, light)
    return {
      light,
      // todo, maybe we want to reference light.color instead of creating a new Color?
      color: new Color(),
      intensity: 1
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.color) && json.color.isColor) component.color.set(json.color)
    if (matches.string.test(json.color)) component.color.value.set(json.color)
    if (matches.number.test(json.intensity)) component.intensity.set(json.intensity)
  },

  toJSON: (entity, component) => {
    return {
      color: component.color.value.getHex(),
      intensity: component.intensity.value
    }
  },

  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.light.value)
  },

  reactor: function ({ root }) {
    if (!hasComponent(root.entity, AmbientLightComponent)) throw root.stop()

    const light = useComponent(root.entity, AmbientLightComponent)

    useEffect(() => {
      light.light.value.color.set(light.color.value)
    }, [light.color])

    useEffect(() => {
      light.light.value.intensity = light.intensity.value
    }, [light.intensity])

    return null
  }
})

export const SCENE_COMPONENT_AMBIENT_LIGHT = 'ambient-light'
