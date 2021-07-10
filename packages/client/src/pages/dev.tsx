import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { CharacterInputSchema } from '@xrengine/engine/src/character/CharacterInputSchema'
import React, { useEffect } from 'react'
import { InitializeOptions } from '../../../engine/src/initializationOptions'

const LocationPage = () => {
  useEffect(() => {
    const initializationOptions: InitializeOptions = {
      publicPath: '',
      input: {
        schema: CharacterInputSchema
      },
      networking: {
        useOfflineMode: true
      },
      renderer: {
        disabled: true,
        postProcessing: false
      }
    }

    initializeEngine(initializationOptions)
  }, [])

  return <></>
}

export default LocationPage
