import * as bitECS from 'bitecs'
import React, { useEffect } from 'react'

import { createReactor, ReactorProps, ReactorRoot } from '@xrengine/hyperflux'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import {
  Component,
  defineComponent,
  EntityRemovedComponent,
  removeAllComponents,
  setComponent,
  useOptionalComponent
} from './ComponentFunctions'

export const createEntity = (world = Engine.instance.currentWorld): Entity => {
  let entity = bitECS.addEntity(world)
  if (entity === 0) entity = bitECS.addEntity(world) // always discard entity 0 since we do a lot of `if (entity)` checks
  return entity as Entity
}

export const removeEntity = (entity: Entity, immediately = false, world = Engine.instance.currentWorld) => {
  if (!entityExists(entity, world)) throw new Error(`[removeEntity]: Entity ${entity} does not exist in the world`)

  removeAllComponents(entity, world)
  setComponent(entity, EntityRemovedComponent, true)

  if (immediately) {
    bitECS.removeEntity(world, entity)
  }
}

export const entityExists = (entity: Entity, world = Engine.instance.currentWorld) => {
  return bitECS.entityExists(world, entity)
}

export interface EntityReactorRoot extends ReactorRoot {
  entity: Entity
}

export interface EntityReactorProps {
  root: EntityReactorRoot
}

export const defineEntityReactor = (def: { name: string; EntityReactor: React.FC<EntityReactorProps> }) => {
  Object.defineProperty(def.EntityReactor, 'name', def.name)

  return defineComponent({
    name: def.name,

    reactor: def.EntityReactor,

    onInit: (entity) => {
      const root = createReactor(() => {
        return <def.EntityReactor root={root} />
      }) as EntityReactorRoot
      root.entity = entity
      return root
    },

    toJSON: () => {},

    onSet: (entity, component, json) => {
      component.value.run()
    },

    onRemove: (entity, component) => {
      component.value.stop()
    }
  })
}
