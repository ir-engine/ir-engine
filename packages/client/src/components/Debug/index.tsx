import { getEntityComponents } from 'bitecs'
import React, { useEffect, useRef, useState } from 'react'
import JSONTree from 'react-json-tree'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { MappedComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

export const Debug = () => {
  const [isShowing, setShowing] = useState(false)
  const showingStateRef = useRef(isShowing)
  const engineState = useEngineState()

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
        [...Engine.currentWorld.namedEntities.entries()].map(([key, value]) => {
          return [
            key,
            Object.fromEntries(
              getEntityComponents(Engine.currentWorld, value).reduce((components, C: MappedComponent<any, any>) => {
                if (C !== NameComponent) components.push([C._name, { ...getComponent(value, C as any) }])
                return components
              }, [] as [string, any][])
            )
          ]
        })
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
          Refresh
        </button>
        <button type="button" value="Physics Debug" onClick={togglePhysicsDebug}>
          Physics Debug
        </button>
        <button type="button" value="Avatar Debug" onClick={toggleAvatarDebug}>
          Avatar Debug
        </button>
        {Network.instance !== null && (
          <div>
            <div>Tick: {engineState.fixedTick.value}</div>
            <div>
              <h1>Named Entities</h1>
              <JSONTree data={renderNamedEntities()} />
            </div>
            <div>
              <h1>Network Object</h1>
              <JSONTree data={{ ...Network.instance }} />
            </div>
            <div>
              <h1>Network Clients</h1>
              <JSONTree data={Object.fromEntries(Engine.currentWorld.clients.entries())} />
            </div>
          </div>
        )}
      </div>
    )
  else return null
}

export default Debug
