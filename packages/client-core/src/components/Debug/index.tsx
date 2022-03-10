import { getEntityComponents } from 'bitecs'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import JSONTree from 'react-json-tree'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { getComponent, MappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchFrom, dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { boxDynamicConfig } from '@xrengine/projects/default-project/PhysicsSimulationTestSystem'

export const Debug = () => {
  const [isShowing, setShowing] = useState(false)
  const showingStateRef = useRef(isShowing)
  const engineState = useEngineState()
  const { t } = useTranslation()
  function setupListener() {
    window.addEventListener('keydown', downHandler)
    console.log('setup keypress')
    window.addEventListener('keypress', (ev) => {
      if (ev.key === 'p') {
        if (document.activeElement?.querySelector('canvas')) {
          togglePhysicsDebug()
          toggleAvatarDebug()
        }
      }

      if (ev.key === 'q') {
        if (document.activeElement?.querySelector('canvas')) {
          dispatchFrom(Engine.userId, () =>
            NetworkWorldAction.spawnDebugPhysicsObject({
              config: boxDynamicConfig // Any custom config can be provided here
            })
          )
        }
      }
    })
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
    dispatchLocal(EngineActions.setPhysicsDebug(!engineState.isPhysicsDebug.value) as any)
  }

  const toggleAvatarDebug = () => {
    dispatchLocal(EngineActions.setAvatarDebug(!engineState.isAvatarDebug.value) as any)
  }

  const renderNamedEntities = () => {
    return {
      ...Object.fromEntries(
        [...Engine.currentWorld.namedEntities.entries()]
          .map(([key, eid]) => {
            try {
              return [
                key + '(' + eid + ')',
                Object.fromEntries(
                  getEntityComponents(Engine.currentWorld, eid).reduce((components, C: MappedComponent<any, any>) => {
                    if (C !== NameComponent) {
                      engineState.fixedTick.value
                      const component = C.isReactive ? getComponent(eid, C).value : getComponent(eid, C)
                      components.push([C._name, { ...component }])
                    }
                    return components
                  }, [] as [string, any][])
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
        {Network.instance !== null && (
          <div>
            <div>
              {t('common:debug.tick')}: {engineState.fixedTick.value}
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
              <JSONTree data={Object.fromEntries(Engine.currentWorld.clients.entries())} />
            </div>
          </div>
        )}
      </div>
    )
  else return null
}

export default Debug
