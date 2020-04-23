/* global React */
import { Entity } from 'aframe-react'
import getConfig from 'next/config'
const env = getConfig().publicRuntimeConfig.xr.environment
const grid = getConfig().publicRuntimeConfig.xr.grid
const landing = getConfig().publicRuntimeConfig.xr.landing

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
    <img id="spoke" src={landing.spoke.src} crossOrigin="anonymous" />
    <img id="vrRoom" src={landing.vrRoom.src} crossOrigin="anonymous" />
    <img
      id="video360banner"
      src={landing.video360.src}
      crossOrigin="anonymous"
    />
    <img id="storebanner" src={landing.store.src} crossOrigin="anonymous" />
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
