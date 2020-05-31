import { useEffect, useState } from 'react'
import { Entity } from 'aframe-react'
import { setAppLoadPercent } from '../../../redux/app/actions'
import { useDispatch } from 'react-redux'
import getConfig from 'next/config'

const config = getConfig().publicRuntimeConfig.xr
const env = config.environment
const grid = config.grid
const spoke = config.spoke
const vrRoomGrid = config.vrRoomGrid
const videoGrid = config.videoGrid
const store = config.store

interface ImageType {
  id: string
  src: string
}

const images: ImageType[] = [
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
  }
]

interface EntityType {
  id: string
  src: string
  primitive: string
}

const entities: EntityType[] = [
  {
    primitive: 'a-gltf-model',
    id: env['scene-gltf'].name,
    src: env['scene-gltf'].src
  }
]

export function getSourceType(src) {
  if (/\.(png|jpg)$/.test(src)) return 'image'
  if (/\.(glb|gltf)$/.test(src)) return 'model'
}

function addAsset(id, src) {
  const type = getSourceType(src)
  switch (type) {
    case 'image':
      images.push({
        id: id,
        src: src
      })
      break
    case 'model':
      entities.push({
        primitive: 'a-gltf-model',
        id: id,
        src: src
      })
      break
  }
}

const landingAssets = [
  {
    id: 'spokeBanner',
    src: spoke.src
  },
  {
    id: 'vrRoomGridBanner',
    src: vrRoomGrid.src
  },
  {
    id: 'videoGridBanner',
    src: videoGrid.src
  },
  {
    id: 'storeBanner',
    src: store.src
  }
]

landingAssets.forEach(({ id, src }) => {
  addAsset(id, src)
})
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
