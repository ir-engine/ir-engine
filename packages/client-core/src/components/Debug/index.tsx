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
import { RootSystemGroup, SimulationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { entityExists } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { System, SystemDefinitions, SystemUUID } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { StatsPanel } from './StatsPanel'
import styles from './styles.module.scss'

type DesiredType =
  | {
      enabled?: boolean
      preSystems?: Record<SystemUUID, DesiredType>
      simulation?: DesiredType
      subSystems?: Record<SystemUUID, DesiredType>
      postSystems?: Record<SystemUUID, DesiredType>
    }
  | boolean // enabled

const convertSystemTypeToDesiredType = (system: System): DesiredType => {
  const { preSystems, subSystems, postSystems } = system
  if (preSystems.length === 0 && subSystems.length === 0 && postSystems.length === 0) {
    return Engine.instance.activeSystems.has(system.uuid)
  }
  const desired: DesiredType = {
    enabled: Engine.instance.activeSystems.has(system.uuid)
  }
  if (preSystems.length > 0) {
    desired.preSystems = preSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = convertSystemTypeToDesiredType(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, DesiredType>
    )
  }
  if (system.uuid === RootSystemGroup) {
    desired.simulation = convertSystemTypeToDesiredType(SystemDefinitions.get(SimulationSystemGroup)!)
  }
  if (subSystems.length > 0) {
    desired.subSystems = subSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = convertSystemTypeToDesiredType(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, DesiredType>
    )
  }
  if (postSystems.length > 0) {
    desired.postSystems = postSystems.reduce(
      (acc, uuid) => {
        acc[uuid] = convertSystemTypeToDesiredType(SystemDefinitions.get(uuid)!)
        return acc
      },
      {} as Record<SystemUUID, DesiredType>
    )
  }
  if (system.uuid === RootSystemGroup) delete desired.enabled
  return desired
}

export const Debug = ({ showingStateRef }) => {
  useHookstate(getMutableState(EngineState).frameTime).value
  const rendererState = useHookstate(getMutableState(RendererState))
  const engineState = useHookstate(getMutableState(EngineState))
  const { t } = useTranslation()
  const hasActiveControlledAvatar =
    Engine.instance.localClientEntity &&
    engineState.joinedWorld.value &&
    hasComponent(Engine.instance.localClientEntity, AvatarControllerComponent)

  const networks = getMutableState(NetworkState).networks

  const onClickRespawn = (): void => {
    Engine.instance.localClientEntity && respawnAvatar(Engine.instance.localClientEntity)
  }

  const toggleDebug = () => {
    rendererState.debugEnable.set(!rendererState.debugEnable.value)
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
      entity,
      components: renderEntityComponents(entity),
      children: {
        ...node.children.reduce(
          (r, child, i) =>
            Object.assign(r, {
              [`${i} - ${getComponent(child, NameComponent) ?? getComponent(child, UUIDComponent)}`]:
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
            if (C !== NameComponent) {
              const component = getComponent(entity, C)
              components.push([C.name, { ...component }])
            }
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

  const toggleNodeHelpers = () => {
    getMutableState(RendererState).nodeHelperVisibility.set(!getMutableState(RendererState).nodeHelperVisibility.value)
  }

  const toggleGridHelper = () => {
    getMutableState(RendererState).gridVisibility.set(!getMutableState(RendererState).gridVisibility.value)
  }

  const namedEntities = useHookstate({})
  const entityTree = useHookstate({} as any)

  const dag = convertSystemTypeToDesiredType(SystemDefinitions.get(RootSystemGroup)!)

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
              className={styles.flagBtn + (rendererState.debugEnable.value ? ' ' + styles.active : '')}
              title={t('common:debug.debug')}
            >
              <Icon type="SquareFoot" fontSize="small" />
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
        <h1>{t('common:debug.entities')}</h1>
        <JSONTree data={namedEntities.get({ noproxy: true })} />
      </div>
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
        <h1>{t('common:debug.state')}</h1>
        <JSONTree
          data={Engine.instance.store.stateMap}
          postprocessValue={(v: any) => (v?.value && v?.get({ noproxy: true })) ?? v}
        />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.systems')}</h1>
        <JSONTree
          data={dag}
          labelRenderer={(raw, ...keyPath) => {
            const label = raw[0]
            if (label === 'preSystems') return <span style={{ color: 'red' }}>{t('common:debug.preSystems')}</span>
            if (label === 'simulation') return <span style={{ color: 'green' }}>{t('common:debug.simulation')}</span>
            if (label === 'subSystems') return <span style={{ color: 'red' }}>{t('common:debug.subSystems')}</span>
            if (label === 'postSystems') return <span style={{ color: 'red' }}>{t('common:debug.postSystems')}</span>
            return <span style={{ color: 'black' }}>{label}</span>
          }}
          valueRenderer={(raw, value, ...keyPath) => {
            const system = SystemDefinitions.get((keyPath[0] === 'enabled' ? keyPath[1] : keyPath[0]) as SystemUUID)!
            return (
              <>
                <input
                  type="checkbox"
                  checked={value ? true : false}
                  onChange={() => {
                    if (Engine.instance.activeSystems.has(system.uuid)) {
                      Engine.instance.activeSystems.delete(system.uuid)
                    } else {
                      Engine.instance.activeSystems.add(system.uuid)
                    }
                  }}
                ></input>
              </>
            )
          }}
          shouldExpandNodeInitially={() => true}
        />
      </div>
    </div>
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
        getMutableState(EngineState).systemPerformanceProfilingEnabled.set(showingStateRef.current)
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
