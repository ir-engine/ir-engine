import React from 'react'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.environment

export default class DefaultAssets extends React.Component {
  componentDidMount() {
  }

  render() {
    return (
      <div>
        <img
          id="groundTexture"
          src={config.floor.groundTexture}
          crossOrigin="anonymous"
        />
        <img
          id="skyTexture"
          src={config.skybox.skyTexture}
          crossOrigin="anonymous"
        />
      </div>
    )
  }
}
