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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  Component,
  getComponent,
  getOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { entityExists } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { NO_PROXY, getMutableState, getState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import { getEntityComponents } from 'bitecs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import styles from './styles.module.scss'

const renderEntityTreeRoots = () => {
  return {
    ...Object.values(getState(SceneState).scenes)
      .map((scene, i) => {
        const root = scene.snapshots[scene.index].data.root
        const entity = UUIDComponent.entitiesByUUID[root]
        if (!entity || !entityExists(entity)) return null
        return {
          [`${i} - ${getComponent(entity, NameComponent) ?? getComponent(entity, UUIDComponent)}`]:
            renderEntityTree(entity)
        }
      })
      .filter((exists) => !!exists)
  }
}

const renderEntityTree = (entity: Entity) => {
  const node = getComponent(entity, EntityTreeComponent)
  return {
    components: renderEntityComponents(entity),
    children: {
      ...node.children.reduce(
        (r, child) =>
          Object.assign(r, {
            [`${child} - ${getComponent(child, NameComponent) ?? getComponent(child, UUIDComponent)}`]:
              renderEntityTree(child)
          }),
        {}
      )
    }
  }
}

const renderEntityComponents = (entity: Entity) => {
  return Object.fromEntries(
    entityExists(entity)
      ? getEntityComponents(Engine.instance, entity).reduce<[string, any][]>((components, C: Component<any, any>) => {
          if (C !== NameComponent) components.push([C.name, getComponent(entity, C)])
          return components
        }, [])
      : []
  )
}

const renderAllEntities = () => {
  return {
    ...Object.fromEntries(
      [...Engine.instance.entityQuery().entries()]
        .map(([key, eid]) => {
          try {
            return [
              '(eid:' +
                eid +
                ') ' +
                (getOptionalComponent(eid, NameComponent) ?? getOptionalComponent(eid, UUIDComponent) ?? ''),
              renderEntityComponents(eid)
            ]
          } catch (e) {
            return null!
          }
        })
        .filter((exists) => !!exists)
    )
  }
}

export const EntityDebug = () => {
  useHookstate(getMutableState(EngineState).frameTime).value
  const { t } = useTranslation()

  const namedEntities = useHookstate({})
  const erroredComponents = useHookstate([] as any[])
  const entityTree = useHookstate({} as any)

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
  namedEntities.set(renderAllEntities())
  entityTree.set(renderEntityTreeRoots())

  return (
    <>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.entityTree')}</h1>
        <JSONTree
          data={entityTree.value}
          postprocessValue={(v: any) => v?.value ?? v}
          shouldExpandNodeInitially={(keyPath, data: any, level) =>
            !!data.components && !!data.children && typeof data.entity === 'number'
          }
        />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.entities')}</h1>
        <JSONTree data={namedEntities.get(NO_PROXY)} />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.erroredEntities')}</h1>
        <JSONTree data={erroredComponents.get(NO_PROXY)} />
      </div>
    </>
  )
}
