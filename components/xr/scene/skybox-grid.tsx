import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.grid.skybox
const rot = config.rotation

export default class Skybox extends React.Component {
  render() {
    return config.src ? (
      <Entity
        primitive="a-sky"
        src="#gridSky"
        rotation={rot}
        radius={config.radius}
        height={config.height}
        width={config.width}
        theta-length={config.thetaLength}
      />
    ) : ''
  }
}
