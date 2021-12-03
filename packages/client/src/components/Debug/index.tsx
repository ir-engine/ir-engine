import { Engine, useEngine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import React, { useEffect, useRef, useState } from 'react'
import JSONTree from 'react-json-tree'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { SocketWebRTCClientTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import { getEntityComponents } from 'bitecs'
import { getComponent, MappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

export const Debug = ({ reinit }) => {
  const [isShowing, setShowing] = useState(false)
  const [physicsDebug, setPhysicsDebug] = useState(false)
  const [avatarDebug, setAvatarDebug] = useState(false)

  const showingStateRef = useRef(isShowing)

  function setupListener() {
    window.addEventListener('keydown', downHandler)
    console.log('setup keypress')
    window.addEventListener('keypress', (ev) => {
      if (ev.key === 'p') {
        togglePhysicsDebug()
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
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.PHYSICS_DEBUG, enabled: !physicsDebug })
    setPhysicsDebug(!physicsDebug)
  }

  const toggleAvatarDebug = () => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.AVATAR_DEBUG, enabled: !avatarDebug })
    setAvatarDebug(!avatarDebug)
  }

  const reset = async () => {
    const transport = Network.instance.transport as SocketWebRTCClientTransport
    if (transport.instanceSocket && typeof transport.instanceSocket.disconnect === 'function')
      await transport.instanceSocket.disconnect()
    if (transport.channelSocket && typeof transport.channelSocket.disconnect === 'function')
      await transport.channelSocket.disconnect()

    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.AVATAR_DEBUG, enabled: false })
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.PHYSICS_DEBUG, enabled: false })
    setAvatarDebug(false)
    setPhysicsDebug(false)

    shutdownEngine()
  }

  const renderComps = () => {
    const entity = useEngine().defaultWorld.entities
    const comps = {}
    entity.forEach((e) => {
      // getAllC e.componentTypes.forEach((ct) => {
      //   const name = ct.prototype.constructor.name
      //   if (!comps[name]) comps[name] = {}
      //   if (e.name) {
      //     comps[name][e.name + '-' + e.id] = e
      //   } else {
      //     comps[name][e.id] = e
      //   }
      // })
    })

    return comps
  }

  const renderNamedEntities = () => {
    return {
      ...Object.fromEntries(
        [...useEngine().defaultWorld.namedEntities.entries()].map(([key, value]) => {
          return [
            key,
            Object.fromEntries(
              getEntityComponents(useEngine().defaultWorld, value).reduce(
                (components, C: MappedComponent<any, any>) => {
                  if (C !== NameComponent) components.push([C._name, getComponent(value, C as any)])
                  return components
                },
                [] as [string, any][]
              )
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
        <button type="button" onClick={reinit}>
          Reinit
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
        {Network.instance !== null && (
          <div>
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
              <JSONTree data={Object.fromEntries(useEngine().defaultWorld.clients.entries())} />
            </div>
            {/* <div>
              <h1>Engine Components</h1>
              <JSONTree data={renderComps()} />
            </div> */}
          </div>
        )}
      </div>
    )
  else return null
}

export default Debug
