import { getEntityComponents } from 'bitecs'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import JSONTree from 'react-json-tree'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  getComponent,
  hasComponent,
  MappedComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import {
  accessEngineRendererState,
  EngineRendererAction,
  useEngineRendererState
} from '@xrengine/engine/src/renderer/EngineRendererState'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { SimpleMaterialTagComponent } from '@xrengine/engine/src/scene/components/SimpleMaterialTagComponent'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { dispatchAction } from '@xrengine/hyperflux'

import BlurOffIcon from '@mui/icons-material/BlurOff'
import GridOnIcon from '@mui/icons-material/GridOn'
import ManIcon from '@mui/icons-material/Man'
import RefreshIcon from '@mui/icons-material/Refresh'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import SquareFootIcon from '@mui/icons-material/SquareFoot'

import { StatsPanel } from './StatsPanel'
import styles from './styles.module.scss'
import { Tick } from './Tick'

export const Debug = () => {
  const [isShowing, setShowing] = useState(false)
  const [remountCount, setRemountCount] = useState(0)
  const [resetStats, setResetStats] = useState(0)
  const showingStateRef = useRef(isShowing)
  const engineRendererState = useEngineRendererState()
  const { t } = useTranslation()
  const networkTransport = Network.instance.getTransport('world')

  function setupListener() {
    window.addEventListener('keydown', downHandler)
  }

  // If pressed key is our target key then set to true
  function downHandler({ keyCode }) {
    if (keyCode === 192) {
      // `
      showingStateRef.current = !showingStateRef.current
      setShowing(showingStateRef.current)
    }
  }

  // Add event listeners
  useEffect(() => {
    setupListener()
    const interval = setInterval(() => {
      setRemountCount(Math.random())
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const refresh = () => {
    setResetStats(resetStats + 1)
    setRemountCount(remountCount + 1)
  }

  const togglePhysicsDebug = () => {
    dispatchAction(
      Engine.instance.store,
      EngineRendererAction.setPhysicsDebug(!engineRendererState.physicsDebugEnable.value)
    )
  }

  const toggleAvatarDebug = () => {
    dispatchAction(
      Engine.instance.store,
      EngineRendererAction.setAvatarDebug(!engineRendererState.avatarDebugEnable.value)
    )
  }

  const renderNamedEntities = () => {
    return {
      ...Object.fromEntries(
        [...Engine.instance.currentWorld.namedEntities.entries()]
          .map(([key, eid]) => {
            try {
              return [
                key + '(' + eid + ')',
                Object.fromEntries(
                  getEntityComponents(Engine.instance.currentWorld, eid).reduce<[string, any][]>(
                    (components, C: MappedComponent<any, any>) => {
                      if (C !== NameComponent) {
                        const component = C.isReactive ? getComponent(eid, C).value : getComponent(eid, C)
                        components.push([C._name, { ...component }])
                      }
                      return components
                    },
                    []
                  )
                )
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
    Engine.instance.currentWorld.camera.layers.toggle(ObjectLayers.NodeHelper)
    dispatchAction(
      Engine.instance.store,
      EngineRendererAction.changeNodeHelperVisibility(!accessEngineRendererState().nodeHelperVisibility.value)
    )
  }

  const toggleGridHelper = () => {
    Engine.instance.currentWorld.camera.layers.toggle(ObjectLayers.Gizmos)
    dispatchAction(
      Engine.instance.store,
      EngineRendererAction.changeGridToolVisibility(!accessEngineRendererState().gridVisibility.value)
    )
  }

  const simpleMaterials = () => {
    if (hasComponent(Engine.instance.currentWorld.worldEntity, SimpleMaterialTagComponent))
      removeComponent(Engine.instance.currentWorld.worldEntity, SimpleMaterialTagComponent)
    else addComponent(Engine.instance.currentWorld.worldEntity, SimpleMaterialTagComponent, {})
    dispatchAction(
      Engine.instance.store,
      EngineRendererAction.changeGridToolVisibility(!accessEngineRendererState().gridVisibility.value)
    )
  }

  if (isShowing)
    return (
      <div className={styles.debugContainer}>
        <div className={styles.debugOptionContainer}>
          <h1>{t('common:debug.debugOptions')}</h1>
          <div className={styles.optionBlock}>
            <div className={styles.flagContainer}>
              <button
                type="button"
                onClick={togglePhysicsDebug}
                className={styles.flagBtn + (engineRendererState.physicsDebugEnable.value ? ' ' + styles.active : '')}
                title={t('common:debug.physicsDebug')}
              >
                <SquareFootIcon fontSize="small" />
              </button>
              <button
                type="button"
                onClick={toggleAvatarDebug}
                className={styles.flagBtn + (engineRendererState.avatarDebugEnable.value ? ' ' + styles.active : '')}
                title={t('common:debug.avatarDebug')}
              >
                <ManIcon fontSize="small" />
              </button>
              <button
                type="button"
                onClick={toggleNodeHelpers}
                className={styles.flagBtn + (engineRendererState.nodeHelperVisibility.value ? ' ' + styles.active : '')}
                title={t('common:debug.nodeHelperDebug')}
              >
                <SelectAllIcon fontSize="small" />
              </button>
              <button
                type="button"
                onClick={toggleGridHelper}
                className={styles.flagBtn + (engineRendererState.gridVisibility.value ? ' ' + styles.active : '')}
                title={t('common:debug.gridDebug')}
              >
                <GridOnIcon fontSize="small" />
              </button>
              <button
                type="button"
                onClick={simpleMaterials}
                className={
                  styles.flagBtn +
                  (hasComponent(Engine.instance.currentWorld.worldEntity, SimpleMaterialTagComponent)
                    ? ' ' + styles.active
                    : '')
                }
                title={t('common:debug.simpleMaterials')}
              >
                <BlurOffIcon fontSize="small" />
              </button>
            </div>
            <div className={styles.refreshBlock}>
              {networkTransport != null && <Tick />}
              <button type="submit" title={t('common:debug.refresh')} onClick={refresh} className={styles.refreshBtn}>
                <RefreshIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
        <StatsPanel show={showingStateRef.current} resetCounter={resetStats} />
        {networkTransport !== null && (
          <>
            <div className={styles.jsonPanel}>
              <h1>{t('common:debug.engineStore')}</h1>
              <JSONTree data={Engine.instance.store} />
            </div>
            <div className={styles.jsonPanel}>
              <h1>{t('common:debug.worldStore')}</h1>
              <JSONTree data={Engine.instance.currentWorld.store} />
            </div>
            <div className={styles.jsonPanel}>
              <h1>{t('common:debug.namedEntities')}</h1>
              <JSONTree data={renderNamedEntities()} />
            </div>
            <div className={styles.jsonPanel}>
              <h1>{t('common:debug.networkObject')}</h1>
              <JSONTree data={{ ...networkTransport }} />
            </div>
            <div className={styles.jsonPanel}>
              <h1>{t('common:debug.networkClients')}</h1>
              <JSONTree data={Object.fromEntries(Engine.instance.currentWorld.clients.entries())} />
            </div>
          </>
        )}
      </div>
    )
  else return null
}

export default Debug
