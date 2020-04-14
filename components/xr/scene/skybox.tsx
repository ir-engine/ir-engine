import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.environment.skybox
const rot = config.rotation

export default class Skybox extends React.Component {
  render() {
    return config.src ? (
      <Entity
        primitive="a-sky"
        src="#skyTexture"
        height={config.height}
        width={config.width}
        radius={config.radius}
        rotation={rot}
        theta-length={config.thetaLength}
      />
    ) : ''
  }
}
