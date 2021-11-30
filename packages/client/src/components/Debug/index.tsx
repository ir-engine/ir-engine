import React, { useEffect, useRef, useState } from 'react'
import JSONTree from 'react-json-tree'
import { useEngine } from '@xrengine/engine/src/ecs/classes/Engine'

export const Debug = () => {
  const [isShowing, setShowing] = useState(false)
  const showingStateRef = useRef(isShowing)

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
        <div>
          <h1>Engine Entities</h1>
          <JSONTree data={{ ...useEngine().defaultWorld.entities }} />
        </div>
      </div>
    )
  else return null
}

export default Debug
