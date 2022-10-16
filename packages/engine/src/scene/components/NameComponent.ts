import { autoUse, createState, none } from '@xrengine/hyperflux'

import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent, setComponent } from '../../ecs/functions/ComponentFunctions'

export const NameComponent = defineComponent({
  name: 'NameComponent',

  onAdd: () => '',

  toJSON: (entity, component) => component,

  onUpdate: (entity, _, name) => {
    NameComponent.map[entity].set(name)
    NameComponent.entitiesByName[name].set(entity)
  },

  onRemove: (entity, name) => {
    if (NameComponent.entitiesByName[name].value === entity) {
      NameComponent.entitiesByName[name].set(none)
    }
  },

  entitiesByName: createState({} as Record<string, Entity>)
})

export const setNameComponent = (entity: Entity, name: string) => {
  setComponent(entity, NameComponent, name)
}

export function useEntityWithName(name = '', fallbackEntity = UndefinedEntity): Entity {
  return autoUse(NameComponent.entitiesByName[name]).value ?? fallbackEntity
}
