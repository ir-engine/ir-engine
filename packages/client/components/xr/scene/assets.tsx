import { useEffect, useState } from 'react'
import { Entity } from 'aframe-react'
import { setAppLoadPercent } from '../../../redux/app/actions'
import { useDispatch } from 'react-redux'
import getConfig from 'next/config'

const config = getConfig().publicRuntimeConfig
const env = config.xr.environment
const grid = config.xr.grid
const spoke = config.xr.spoke
const vrRoomGrid = config.xr.vrRoomGrid
const videoGrid = config.xr.videoGrid
const store = config.xr.store

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
    src: config.logo
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
  },
  {
    primitive: 'a-gltf-model',
    id: videoGrid['scene-gltf'].name,
    src: videoGrid['scene-gltf'].src
  }
]

export function getSourceType (src): any {
  if (/\.(png|jpg)$/.test(src)) return 'image'
  if (/\.(glb|gltf)$/.test(src)) return 'model'
}

function addAsset (id, src): any {
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

export const Assets = (): any => {
  const [numLoaded, setNumLoaded] = useState(0)
  const totalToLoad = images.length + entities.length
  const dispatch = useDispatch()
  const handleAssetLoaded = (): any => {
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
        entities.map((props: any): any => <Entity crossOrigin="anonymous" {...props} key={props.id}
          events={{
            loaded: handleAssetLoaded
          }} />)
      }
      {
        videos.map((props: any): any => <video crossOrigin="anonymous" {...props} key={props.id}/>)
      }
    </Entity>
  )
}
export default Assets
