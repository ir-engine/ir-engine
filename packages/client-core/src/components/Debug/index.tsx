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

import { getEntityComponents } from 'bitecs'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { AvatarControllerComponent } from '@etherealengine/engine/src/avatar/components/AvatarControllerComponent'
import { respawnAvatar } from '@etherealengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  Component,
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { entityExists } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { System, SystemDefinitions, SystemUUID } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  AnimationSystemGroup,
  InputSystemGroup,
  PresentationSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/SystemGroups'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { HyperFlux, NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import ActionsPanel from './ActionsPanel'
import { StatsPanel } from './StatsPanel'
import styles from './styles.module.scss'

type SystemTree = {
  preSystems: Record<SystemUUID, SystemTree>
  subSystems: Record<SystemUUID, SystemTree>
  postSystems: Record<SystemUUID, SystemTree>
}

const expandSystemToTree = (system: System): SystemTree => {
  return {
    preSystems: system.preSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = expandSystemToTree(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, SystemTree>
    ),
    subSystems: system.subSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = expandSystemToTree(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, SystemTree>
    ),
    postSystems: system.postSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = expandSystemToTree(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, SystemTree>
    )
  }
}

export const Debug = ({ showingStateRef }: { showingStateRef: React.MutableRefObject<boolean> }) => {
  useHookstate(getMutableState(EngineState).frameTime).value
  const rendererState = useHookstate(getMutableState(RendererState))
  const engineState = useHookstate(getMutableState(EngineState))

  engineState.frameTime.value // make Engine.instance data reactive in the render tree

  const { t } = useTranslation()
  const hasActiveControlledAvatar =
    !!Engine.instance.localClientEntity && hasComponent(Engine.instance.localClientEntity, AvatarControllerComponent)

  const onClickRespawn = (): void => {
    Engine.instance.localClientEntity && respawnAvatar(Engine.instance.localClientEntity)
  }

  const toggleDebug = () => {
    rendererState.physicsDebug.set(!rendererState.physicsDebug.value)
  }

  const toggleAvatarDebug = () => {
    rendererState.avatarDebug.set(!rendererState.avatarDebug.value)
  }

  const renderEntityTreeRoots = () => {
    return {
      ...Object.keys(EntityTreeComponent.roots.value).reduce(
        (r, child, i) =>
          Object.assign(r, {
            [`${i} - ${
              getComponent(child as any as Entity, NameComponent) ?? getComponent(child as any as Entity, UUIDComponent)
            }`]: renderEntityTree(child as any as Entity)
          }),
        {}
      )
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
        ? getEntityComponents(Engine.instance.store, entity).reduce<[string, any][]>(
            (components, C: Component<any, any>) => {
              if (C !== NameComponent) {
                const component = getComponent(entity, C)
                if (typeof component === 'object') components.push([C.name, { ...component }])
                else components.push([C.name, component])
              }
              return components
            },
            []
          )
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

  const toggleNodeHelpers = () => {
    getMutableState(RendererState).nodeHelperVisibility.set(!getMutableState(RendererState).nodeHelperVisibility.value)
  }

  const toggleGridHelper = () => {
    getMutableState(RendererState).gridVisibility.set(!getMutableState(RendererState).gridVisibility.value)
  }

  const namedEntities = useHookstate({})
  const entityTree = useHookstate({} as any)

  namedEntities.set(renderAllEntities())
  entityTree.set(renderEntityTreeRoots())
  return (
    <div className={styles.debugContainer} style={{ pointerEvents: 'all' }}>
      <div className={styles.debugOptionContainer}>
        <h1>{t('common:debug.debugOptions')}</h1>
        <div className={styles.optionBlock}>
          <div className={styles.flagContainer}>
            <button
              type="button"
              onClick={toggleDebug}
              className={styles.flagBtn + (rendererState.physicsDebug.value ? ' ' + styles.active : '')}
              title={t('common:debug.debug')}
            >
              <Icon type="SquareFoot" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={toggleAvatarDebug}
              className={styles.flagBtn + (rendererState.avatarDebug.value ? ' ' + styles.active : '')}
              title={t('common:debug.debug')}
            >
              <Icon type="Person" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={toggleNodeHelpers}
              className={styles.flagBtn + (rendererState.nodeHelperVisibility.value ? ' ' + styles.active : '')}
              title={t('common:debug.nodeHelperDebug')}
            >
              <Icon type="SelectAll" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={toggleGridHelper}
              className={styles.flagBtn + (rendererState.gridVisibility.value ? ' ' + styles.active : '')}
              title={t('common:debug.gridDebug')}
            >
              <Icon type="GridOn" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => rendererState.forceBasicMaterials.set(!rendererState.forceBasicMaterials.value)}
              className={styles.flagBtn + (rendererState.forceBasicMaterials.value ? ' ' + styles.active : '')}
              title={t('common:debug.forceBasicMaterials')}
            >
              <Icon type="FormatColorReset" fontSize="small" />
            </button>
            {hasActiveControlledAvatar && (
              <button type="button" className={styles.flagBtn} id="respawn" onClick={onClickRespawn}>
                <Icon type="Refresh" />
              </button>
            )}
          </div>
        </div>
      </div>
      <StatsPanel show={showingStateRef.current} />
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
        <h1>{t('common:debug.state')}</h1>
        <JSONTree
          data={Engine.instance.store.stateMap}
          postprocessValue={(v: any) => (v?.value && v.get(NO_PROXY)) ?? v}
        />
      </div>
      <ActionsPanel />
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.systems')}</h1>
        <SystemDagView uuid={InputSystemGroup} />
        <SystemDagView uuid={SimulationSystemGroup} />
        <SystemDagView uuid={AnimationSystemGroup} />
        <SystemDagView uuid={PresentationSystemGroup} />
      </div>
    </div>
  )
}

export const SystemDagView = (props: { uuid: SystemUUID }) => {
  const { t } = useTranslation()
  return (
    <JSONTree
      data={expandSystemToTree(SystemDefinitions.get(props.uuid)!)}
      labelRenderer={(raw, ...keyPath) => {
        const label = raw[0]
        if (label === 'preSystems' || label === 'subSystems' || label === 'postSystems')
          return <span style={{ color: 'green' }}>{t(`common:debug.${label}`)}</span>
        return <span style={{ color: 'black' }}>{label}</span>
      }}
      valueRenderer={(raw, value, ...keyPath) => {
        const system = SystemDefinitions.get(keyPath[0] as SystemUUID)!
        const systemReactor = system ? HyperFlux.store.activeSystemReactors.get(system.uuid) : undefined
        return (
          <>
            {systemReactor?.error.value && (
              <span style={{ color: 'red' }}>
                {systemReactor.error.value.name}: {systemReactor.error.value.message}
              </span>
            )}
          </>
        )
      }}
      shouldExpandNodeInitially={() => true}
    />
  )
}

export const DebugToggle = () => {
  const [isShowing, setShowing] = useState(false)
  const showingStateRef = useRef(isShowing)

  useEffect(() => {
    function downHandler({ keyCode }) {
      if (keyCode === 192) {
        showingStateRef.current = !showingStateRef.current
        setShowing(showingStateRef.current)
        HyperFlux.store.systemPerformanceProfilingEnabled = showingStateRef.current
      }
    }
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return isShowing ? <Debug showingStateRef={showingStateRef} /> : <></>
}

export default DebugToggle
