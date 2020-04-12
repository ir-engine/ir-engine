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
          src={config.floor.src}
          crossOrigin="anonymous"
        />
        <img
          id="skyTexture"
          src={config.skybox.src}
          crossOrigin="anonymous"
        />
        <a-gltf-model id={config['scene-gltf'].name}
          src={config['scene-gltf'].src}
          crossOrigin="anonymous"/>

        <video id="video360Shaka"
        ></video>
      </div>
    )
  }
}
