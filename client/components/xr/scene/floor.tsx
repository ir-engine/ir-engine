import React from 'react'
import { Entity } from 'aframe-react'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.environment.floor

export const Floor = () => {
  return (
    <Entity
      primitive="a-plane"
      src="#groundTexture"
      rotation="-90 0 0"
      height={config.height}
      width={config.width}
      repeat="10 10" />
  )
}
export default Floor
