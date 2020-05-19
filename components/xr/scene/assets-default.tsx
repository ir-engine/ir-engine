/* global React */
import { Entity } from 'aframe-react'
import getConfig from 'next/config'
import { useState, useEffect } from 'react'
const env = getConfig().publicRuntimeConfig.xr.environment
const grid = getConfig().publicRuntimeConfig.xr.grid

const images = [
  {
    id: 'groundTexture',
    src: env.floor.src
  },
  {
    id: 'skyTexture',
    src: env.skybox.src
  },
  {
    id: 'gridSky',
    src: grid.skybox.src
  },
  {
    id: 'placeholder',
    src: 'https://kaixr-static.s3-us-west-2.amazonaws.com/logo.png'
  },
  {
    id: 'spoke',
    src: 'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/create.png'
  },
  {
    id: 'vrRoom',
    src: 'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/dream.png'
  },
  {
    id: 'video360banner',
    src: 'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/explore.png'
  },
  {
    id: 'storebanner',
    src: 'https://kaixr-static.s3-us-west-2.amazonaws.com/banner/shop.png'
  }
]
const entities = [
  {
    primitive: 'a-gltf-model',
    id: env['scene-gltf'].name,
    src: env['scene-gltf'].src
  }
]
// not putting onLoad event on this because no src and it doesn't fire loaded event.
const videos = [
  {
    id: 'video360Shaka'
  }
]
const DefaultAssets = () => {
  const [numLoaded, setNumLoaded] = useState(0)
  const totalToLoad = images.length + entities.length// + videos.length;
  const handleAssetLoaded = (e) => {
    console.log('loaded', e.target)
    setNumLoaded(numLoaded => numLoaded + 1)
  }
  useEffect(() => {
    console.log('loaded percent:', (numLoaded / totalToLoad) * 100 + '%')
    // save in redux so loading bar can use it
  }, [numLoaded, totalToLoad])
  return (
    <>
      {images.map(({ id, src }) => {
        return (<img id={id} src={src} crossOrigin="anonymous" onLoad={handleAssetLoaded} key={id}/>)
      })}
      {
        entities.map((props: any) => <Entity crossOrigin="anonymous" {...props} key={props.id}
          events={{
            loaded: handleAssetLoaded
          }} />)
      }
      {
        videos.map((props: any) => <video crossOrigin="anonymous" {...props} key={props.id}/>)
      }
    </>
  )
}

export default DefaultAssets
