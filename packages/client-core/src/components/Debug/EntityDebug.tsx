/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  Component,
  ComponentMap,
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { entityExists } from '@etherealengine/ecs/src/EntityFunctions'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import {
  HyperFlux,
  NO_PROXY,
  defineState,
  getMutableState,
  getState,
  syncStateWithLocalStorage
} from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useHookstate } from '@hookstate/core'
import { getEntityComponents } from 'bitecs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { defineQuery, removeQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { useExecute } from '@etherealengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { getAllEntities } from 'bitecs'
import styles from './styles.module.scss'

const renderEntityTreeRoots = () => {
  return Object.fromEntries(
    Object.values(getState(SceneState).scenes)
      .map((scene, i) => {
        const root = scene.snapshots[scene.index].data.root
        const entity = UUIDComponent.getEntityByUUID(root)
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
        .sort(([a], [b]) => a.localeCompare(b))
    )
  }
}

const EntitySearchState = defineState({
  name: 'EntitySearchState',
  initial: {
    search: '',
    query: ''
  },
  onCreate: (store, state) => {
    syncStateWithLocalStorage(EntitySearchState, ['search', 'query'])
  }
})

export const EntityDebug = () => {
  const { t } = useTranslation()

  const namedEntities = useHookstate({})
  const erroredComponents = useHookstate([] as any[])
  const entityTree = useHookstate({} as any)
  const entitySearch = useHookstate(getMutableState(EntitySearchState).search)
  const entityQuery = useHookstate(getMutableState(EntitySearchState).query)

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
    <>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.scenes')}</h1>
        <JSONTree data={entityTree.value} postprocessValue={(v: any) => v?.value ?? v} />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.entities')}</h1>
        <input
          type="text"
          placeholder="Search..."
          value={entitySearch.value}
          onChange={(e) => entitySearch.set(e.target.value)}
        />
        <input
          type="text"
          placeholder="Query..."
          value={entityQuery.value}
          onChange={(e) => entityQuery.set(e.target.value)}
        />
        <JSONTree data={namedEntities.get(NO_PROXY)} />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.erroredEntities')}</h1>
        <JSONTree data={erroredComponents.get(NO_PROXY)} />
      </div>
    </>
  )
}
