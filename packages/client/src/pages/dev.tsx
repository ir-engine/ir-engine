import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import React, { useEffect } from 'react'

const LocationPage = () => {
  useEffect(() => {
    initializeEngine()
  }, [])

  return <></>
}

export default LocationPage
