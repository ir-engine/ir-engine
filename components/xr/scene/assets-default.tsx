/* global React */
import { Entity } from 'aframe-react'
import getConfig from 'next/config'
const env = getConfig().publicRuntimeConfig.xr.environment
const grid = getConfig().publicRuntimeConfig.xr.grid

const DefaultAssets = () => (
  <>
    <img id="groundTexture" src={env.floor.src} crossOrigin="anonymous" />
    <img id="skyTexture" src={env.skybox.src} crossOrigin="anonymous" />
    <img id="gridSky" src={grid.skybox.src} crossOrigin="anonymous" />
    <img
      id="placeholder"
      src={grid.placeholderImageSrc}
      crossOrigin="anonymous"
    />
    <img id="spoke" src={'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/create.png'} crossOrigin="anonymous" />
    <img id="vrRoom" src={'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/dream.png'} crossOrigin="anonymous" />
    <img
      id="video360banner"
      src={'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/explore.png'}
      crossOrigin="anonymous"
    />
    <img id="storebanner" src={'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/shop.png'} crossOrigin="anonymous" />
    <Entity
      primitive="a-gltf-model"
      id={env['scene-gltf'].name}
      src={env['scene-gltf'].src}
      crossOrigin="anonymous"
    />

    <video id="video360Shaka" crossOrigin="anonymous"></video>
  </>
)

export default DefaultAssets
