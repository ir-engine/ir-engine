import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.environment.skybox

export default class Skybox extends React.Component {
  render() {
    return (
      <Entity
        primitive="a-sky"
        src="#skyTexture"
        height={config.height}
        width={config.width}
        radius={config.radius}
        theta-length="90"
      />
    )
  }
}
