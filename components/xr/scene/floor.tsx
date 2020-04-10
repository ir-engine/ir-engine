import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.environment.floor

export default class Floor extends React.Component {
  render() {
    return (
      <Entity
        primitive="a-plane"
        src="#groundTexture"
        rotation="-90 0 0"
        height={config.height}
        width={config.height}
      />
    )
  }
}
