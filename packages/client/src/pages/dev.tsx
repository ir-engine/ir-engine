import React, { useEffect } from 'react'

import { initializeEngine } from '@xrengine/engine/src/initializeEngine'

const LocationPage = () => {
  useEffect(() => {
    initializeEngine()
  }, [])

  return <></>
}

export default LocationPage
