import React from 'react'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.environment
const grid = getConfig().publicRuntimeConfig.xr.grid

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
        <img
          id="gridSky"
          src={grid.skybox.src}
          crossOrigin="anonymous"
        />
        <img
          id="placeholder"
          src={grid.placeholderImageSrc}
          crossOrigin="anonymous"
        />
        <a-gltf-model id={config['scene-gltf'].name}
          src={config['scene-gltf'].src}
          crossOrigin="anonymous"/>

        <video id="video360Shaka"
          crossOrigin="anonymous">
        </video>
      </div>
    )
  }
}
