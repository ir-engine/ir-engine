/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getAllEntities, getEntityComponents } from 'bitecs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { UUIDComponent } from '@ir-engine/ecs'
import {
  Component,
  ComponentMap,
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { entityExists } from '@ir-engine/ecs/src/EntityFunctions'
import { defineQuery, removeQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { GLTFSourceState } from '@ir-engine/engine/src/gltf/GLTFState'
import {
  HyperFlux,
  NO_PROXY,
  defineState,
  getState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { Input } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

const renderEntityTreeRoots = () => {
  return Object.fromEntries(
    Object.values(getState(GLTFSourceState))
      .map((entity, i) => {
        if (!entity || !entityExists(entity)) return []
        return [
          `${entity} - ${getOptionalComponent(entity, NameComponent) ?? getOptionalComponent(entity, UUIDComponent)}`,
          renderEntityTree(entity)
        ]
      })
      .filter(([exists]) => !!exists)
  )
}

const renderEntityTree = (entity: Entity) => {
  const node = getComponent(entity, EntityTreeComponent)
  return {
    components: renderEntityComponents(entity),
    children: node
      ? {
          ...node.children.reduce(
            (r, child) =>
              Object.assign(r, {
                [`${child} - ${
                  getOptionalComponent(child, NameComponent) ?? getOptionalComponent(child, UUIDComponent)
                }`]: renderEntityTree(child)
              }),
            {}
          )
        }
      : {}
  }
}

const renderEntityComponents = (entity: Entity) => {
  return Object.fromEntries(
    entityExists(entity)
      ? getEntityComponents(HyperFlux.store, entity).reduce<[string, any][]>((components, C: Component<any, any>) => {
          if (C !== NameComponent) components.push([C.name, getComponent(entity, C)])
          return components
        }, [])
      : []
  )
}

const getQueryFromString = (queryString: string) => {
  const queryComponents = queryString
    .split(',')
    .filter((name) => ComponentMap.has(name))
    .map((name) => ComponentMap.get(name)!)
  const query = defineQuery(queryComponents)
  const entities = query()
  removeQuery(query)
  return entities
}

const renderAllEntities = (filter: string, queryString: string) => {
  const entities = queryString ? getQueryFromString(queryString) : (getAllEntities(HyperFlux.store) as Entity[])
  return {
    ...Object.fromEntries(
      [...entities.entries()]
        .map(([, eid]) => {
          if (!entityExists(eid)) return null!

          const label = `${eid} - ${
            getOptionalComponent(eid, NameComponent) ?? getOptionalComponent(eid, UUIDComponent) ?? ''
          }`

          if (
            filter !== '' &&
            (!hasComponent(eid, NameComponent) || label.toLowerCase().indexOf(filter.toLowerCase()) === -1)
          )
            return null!

          return [label, renderEntityComponents(eid)]
        })
        .filter((exists) => !!exists)
    )
  }
}

const EntitySearchState = defineState({
  name: 'EntitySearchState',
  initial: {
    search: '',
    query: ''
  },
  extension: syncStateWithLocalStorage(['search', 'query'])
})

export const EntityDebug = () => {
  const { t } = useTranslation()

  const namedEntities = useHookstate({})
  const erroredComponents = useHookstate([] as any[])
  const entityTree = useHookstate({} as any)
  const entitySearch = useMutableState(EntitySearchState).search
  const entityQuery = useMutableState(EntitySearchState).query

  erroredComponents.set(
    [...Engine.instance.store.activeReactors.values()]
      .filter((reactor) => (reactor as any).entity && reactor.errors.length)
      .map((reactor) => {
        return reactor.errors.map((error) => {
          return {
            entity: (reactor as any).entity,
            component: (reactor as any).component,
            error
          }
        })
      })
      .flat()
  )

  useExecute(
    () => {
      namedEntities.set(renderAllEntities(entitySearch.value, entityQuery.value))
      entityTree.set(renderEntityTreeRoots())
    },
    { after: PresentationSystemGroup }
  )

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-1">
        <Text>{t('common:debug.scenes')}</Text>
        <JSONTree data={entityTree.get(NO_PROXY)} postprocessValue={(v: any) => v?.value ?? v} />
      </div>
      <div className="my-1">
        <Text>{t('common:debug.entities')}</Text>
        <Input
          placeholder="Search..."
          value={entitySearch.value}
          onChange={(event) => entitySearch.set(event.target.value)}
        />
        <Input placeholder="Query..." value={entityQuery.value} onChange={(e) => entityQuery.set(e.target.value)} />
        <JSONTree data={namedEntities.get(NO_PROXY)} />
      </div>
      <div className="my-1">
        <Text>{t('common:debug.erroredEntities')}</Text>
        <JSONTree data={erroredComponents.get(NO_PROXY)} />
      </div>
    </div>
  )
}
