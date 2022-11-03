import { hookstate, none } from '@xrengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, SetComponentType } from '../../ecs/functions/ComponentFunctions'

export const NameComponent = defineComponent({
  name: 'NameComponent',

  onInit: () => '',

  onSet: (
    entity,
    component,
    name?:
      | string
      | {
          /**
           * @deprecated
           */
          name: string
        }
  ) => {
    const _name = typeof name === 'string' ? name : name?.name // TODO: remove support for {name:string} parameter
    if (!_name) throw new Error('NameComponent expects a non-empty string')
    component.set(_name)
    NameComponent.entitiesByName[_name].set(entity)
  },

  onRemove: (entity, component) => {
    const name = component.value
    if (NameComponent.entitiesByName[name].value === entity) {
      NameComponent.entitiesByName[name].set(none)
    }
  },

  entitiesByName: hookstate({} as Record<string, Entity>)
})
