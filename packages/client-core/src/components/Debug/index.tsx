import { getEntityComponents } from 'bitecs'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import JSONTree from 'react-json-tree'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { getComponent, MappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import {
  accessEngineRendererState,
  EngineRendererAction,
  useEngineRendererState
} from '@xrengine/engine/src/renderer/EngineRendererState'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'
import { dispatchAction } from '@xrengine/hyperflux'

export const Debug = () => {
  const [isShowing, setShowing] = useState(false)
  const showingStateRef = useRef(isShowing)
  const engineState = useEngineState()
  const engineRendererState = useEngineRendererState()
  const { t } = useTranslation()
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

  const [remountCount, setRemountCount] = useState(0)
  const refresh = () => setRemountCount(remountCount + 1)
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
                        engineState.fixedTick.value
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
    Engine.instance.camera.layers.toggle(ObjectLayers.NodeHelper)
    dispatchAction(
      Engine.instance.store,
      EngineRendererAction.changeNodeHelperVisibility(!accessEngineRendererState().nodeHelperVisibility.value)
    )
  }

  const toggleGridHelper = () => {
    Engine.instance.camera.layers.toggle(ObjectLayers.Gizmos)
    dispatchAction(
      Engine.instance.store,
      EngineRendererAction.changeGridToolVisibility(!accessEngineRendererState().gridVisibility.value)
    )
  }

  if (isShowing)
    return (
      <div
        style={{
          position: 'absolute',
          overflowY: 'auto',
          top: 0,
          zIndex: 100000,
          height: 'auto',
          maxHeight: '95%',
          width: 'auto',
          maxWidth: '50%'
        }}
      >
        <button type="submit" value="Refresh" onClick={refresh}>
          {t('common:debug.refresh')}
        </button>
        <button type="button" value="Physics Debug" onClick={togglePhysicsDebug}>
          {t('common:debug.physicsDebug')}
        </button>
        <button type="button" value="Avatar Debug" onClick={toggleAvatarDebug}>
          {t('common:debug.avatarDebug')}
        </button>
        <button type="button" value="Node Debug" onClick={toggleNodeHelpers}>
          {t('common:debug.nodeHelperDebug')}
        </button>
        <button type="button" value="Grid Debug" onClick={toggleGridHelper}>
          {t('common:debug.gridDebug')}
        </button>
        {Network.instance !== null && (
          <div>
            <div>
              {t('common:debug.tick')}: {engineState.fixedTick.value}
            </div>
            <div>
              <h1>{t('common:debug.engineStore')}</h1>
              <JSONTree data={Engine.instance.store} />
            </div>
            <div>
              <h1>{t('common:debug.worldStore')}</h1>
              <JSONTree data={Engine.instance.currentWorld.store} />
            </div>
            <div>
              <h1>{t('common:debug.namedEntities')}</h1>
              <JSONTree data={renderNamedEntities()} />
            </div>
            <div>
              <h1>{t('common:debug.networkObject')}</h1>
              <JSONTree data={{ ...Network.instance }} />
            </div>
            <div>
              <h1>{t('common:debug.networkClients')}</h1>
              <JSONTree data={Object.fromEntries(Engine.instance.currentWorld.clients.entries())} />
            </div>
          </div>
        )}
      </div>
    )
  else return null
}

export default Debug
