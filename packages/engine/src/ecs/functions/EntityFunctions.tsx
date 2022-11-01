import * as bitECS from 'bitecs'
import React, { useEffect } from 'react'

import { createReactor, ReactorProps, ReactorRoot, useHookstate } from '@xrengine/hyperflux'

import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import {
  Component,
  defineComponent,
  EntityRemovedComponent,
  getComponent,
  removeAllComponents,
  setComponent,
  useComponent,
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

export function UnmountComponent({ root }) {
  useEffect(() => {
    root.stop()
  }, [])
  return null
}

export function createEntityReactorWrapper<ComponentType>(
  Component: Component<ComponentType, unknown, unknown>,
  Reactor: React.FC<ReactorProps>
) {
  return function EntityReactorWrapper({ root }: EntityReactorProps) {
    const component = useOptionalComponent(root.entity, Component) //useHookstate(Component.map[root.entity])
    const validReactor = bitECS.entityExists(Engine.instance.currentWorld, root.entity) && component
    // console.log(validReactor, Component.name, root.entity)
    // if (!validReactor) root.stop() /** @todo throw root.stop() */
    return validReactor ? <Reactor root={root} /> : <UnmountComponent root={root} />
  }
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
