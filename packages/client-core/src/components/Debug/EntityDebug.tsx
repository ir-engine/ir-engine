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
