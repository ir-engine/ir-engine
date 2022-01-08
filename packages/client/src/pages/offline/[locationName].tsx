import React from 'react'

import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'

import { LoadEngineWithScene } from '../../components/World/LoadEngineWithScene'
import { LoadLocationScene } from '../../components/World/LoadLocationScene'

const engineInitializeOptions: InitializeOptions = {}

const LocationPage = (props) => {
  return (
    <>
      <LoadLocationScene locationName={props.match.params.locationName} />
      <LoadEngineWithScene engineInitializeOptions={engineInitializeOptions} />
    </>
  )
}

export default LocationPage
