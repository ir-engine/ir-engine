import { hookstate, none } from '@xrengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const NameComponent = defineComponent({
  name: 'NameComponent',

  onInit: () => '',

  onSet: (entity, component, name?: string) => {
    if (typeof name !== 'string') throw new Error('NameComponent expects a non-empty string')
    component.set(name)
    NameComponent.entitiesByName[name].set(entity)
  },

  onRemove: (entity, component) => {
    const name = component.value
    if (NameComponent.entitiesByName[name].value === entity) {
      NameComponent.entitiesByName[name].set(none)
    }
  },

  entitiesByName: hookstate({} as Record<string, Entity>)
})
