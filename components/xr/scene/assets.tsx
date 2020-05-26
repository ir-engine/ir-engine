import { useEffect, useState } from 'react'
import { Entity } from 'aframe-react'
import { setAppLoadPercent } from '../../../redux/app/actions'
import { useDispatch } from 'react-redux'
import getConfig from 'next/config'
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

export const Assets = () => {
  const [numLoaded, setNumLoaded] = useState(0)
  const totalToLoad = images.length + entities.length
  const dispatch = useDispatch()
  const handleAssetLoaded = () => {
    setNumLoaded(numLoaded => numLoaded + 1)
  }
  useEffect(() => {
    dispatch(setAppLoadPercent((numLoaded / totalToLoad) * 100))
  }, [numLoaded, totalToLoad])
  return (
    <Entity primitive={'a-assets'}>
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
    </Entity>
  )
}
export default Assets
