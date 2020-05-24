import { Entity } from 'aframe-react'
import Lights from './lights'
import Skybox from './skybox'

import getConfig from 'next/config'
export const Environment = () => {
  const config = getConfig().publicRuntimeConfig.xr.environment['scene-gltf']
  const gltfsrc = '#' + config.name
  return (
    <Entity>
      <a-gltf-model src={gltfsrc} position="0 0 -50" />
      <Lights />
      <Skybox />
    </Entity>
  )
}

export default Environment
