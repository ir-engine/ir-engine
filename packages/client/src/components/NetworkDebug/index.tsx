import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { DebugHelpersSystem } from '@xrengine/engine/src/debug/systems/DebugHelpersSystem'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import React, { useEffect, useRef, useState } from 'react'
import JSONTree from 'react-json-tree'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { resetEngine } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { Downgraded } from '@hookstate/core'
import { useUserState } from '@xrengine/client-core/src/user/store/UserState'

export const NetworkDebug = ({ reinit }) => {
  const [isShowing, setShowing] = useState(false)
  const [physicsDebug, setPhysicsDebug] = useState(false)
  const [avatarDebug, setAvatarDebug] = useState(false)

  const showingStateRef = useRef(isShowing)

  const userState = useUserState().attach(Downgraded).value

  function setupListener() {
    window.addEventListener('keydown', downHandler)
  }
  document.addEventListener('keypress', (ev) => {
    if (ev.key === 'p') {
      EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_PHYSICS, enabled: !physicsDebug })
      EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_AVATAR, enabled: !physicsDebug })
      setPhysicsDebug(!physicsDebug)
    }
  })

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
    EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_PHYSICS, enabled: !physicsDebug })
    setPhysicsDebug(!physicsDebug)
  }

  const toggleAvatarDebug = () => {
    EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_AVATAR, enabled: !avatarDebug })
    setAvatarDebug(!avatarDebug)
  }

  const reset = async () => {
    const transport = Network.instance.transport as SocketWebRTCClientTransport
    if (transport.instanceSocket && typeof transport.instanceSocket.disconnect === 'function')
      await transport.instanceSocket.disconnect()
    if (transport.channelSocket && typeof transport.channelSocket.disconnect === 'function')
      await transport.channelSocket.disconnect()

    EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_AVATAR, enabled: false })
    setAvatarDebug(false)

    EngineEvents.instance.dispatchEvent({ type: DebugHelpersSystem.EVENTS.TOGGLE_PHYSICS, enabled: false })
    setPhysicsDebug(false)

    resetEngine()
  }

  const renderComps = () => {
    const entity = Engine.entities
    const comps = {}
    entity.forEach((e) => {
      e.componentTypes.forEach((ct) => {
        const name = ct.prototype.constructor.name

        if (!comps[name]) comps[name] = {}

        if (e.name) {
          comps[name][e.name + '-' + e.id] = e
        } else {
          comps[name][e.id] = e
        }
      })
    })

    return comps
  }

  const renderEntities = () => {
    const map = {}
    Engine.entities.forEach((e) => {
      if (e.name) {
        map[e.name + '-' + e.id] = e
      } else {
        map[e.id] = e
      }
    })
    return map
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
              <h1>Network Object</h1>
              <JSONTree data={{ ...Network.instance }} />
            </div>
            <div>
              <h1>Network Clients</h1>
              <JSONTree data={{ ...Network.instance.clients }} />
            </div>
            <div>
              <h1>Network Objects</h1>
              <JSONTree data={{ ...Network.instance.networkObjects }} />
            </div>
            <div>
              <h1>Engine Entities</h1>
              <JSONTree data={renderEntities()} />
            </div>
            <div>
              <h1>Engine Components</h1>
              <JSONTree data={renderComps()} />
            </div>
            <div>
              <h1>Store</h1>
              <JSONTree data={userState} />
            </div>
          </div>
        )}
      </div>
    )
  else return null
}

export default NetworkDebug
