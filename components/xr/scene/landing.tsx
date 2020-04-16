import React from 'react'
import { useRouter } from 'next/router'
// @ts-ignore
import { Entity } from 'aframe-react'
import Skybox from './skybox-grid'
import './index.scss'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.landing

const spokePos = config.offset.x + ' ' + (config.offset.y + config.cellHeight * 2) + ' ' + config.offset.z
const vrRoomPos = config.offset.x + ' ' + (config.offset.y + config.cellHeight * 1) + ' ' + config.offset.z
const video360Pos = config.offset.x + ' ' + (config.offset.y + config.cellHeight * 0) + ' ' + config.offset.z
const storePos = config.offset.x + ' ' + (config.offset.y + config.cellHeight * -1) + ' ' + config.offset.z

function Landing() {
  const router = useRouter()

  function followLink(link: any) {
    router.push(link)
  }

  const spokeLink = (e: MouseEvent) => {
    e.preventDefault()
    followLink(config.spoke.link)
  }

  const vrRoomLink = (e: MouseEvent) => {
    e.preventDefault()
    followLink(config.vrRoom.link)
  }

  const videoLink = (e: MouseEvent) =>{
    e.preventDefault()
    followLink(config.video360.link)
  }

  const storeLink = (e: MouseEvent) => {
    e.preventDefault()
    followLink(config.store.link)
  }

  return (
    <Entity>
      <Skybox/>
      <Entity
        player="fuseCursor: true"/>

      <Entity
        class="spoke"
        primitive="a-image"
        src="#spoke"
        width={config.cellWidth}
        height={config.cellContentHeight}
        position={spokePos}
        events={{ click: spokeLink } }/>
      <Entity
        class="vr-room clickable"
        primitive="a-image"
        src="#vrRoom"
        width={config.cellWidth}
        height={config.cellContentHeight}
        position={vrRoomPos}
        events={{ click: vrRoomLink } }/>
      <Entity
        class="video360 clickable"
        primitive="a-image"
        src="#video360banner"
        width={config.cellWidth}
        height={config.cellContentHeight}
        position={video360Pos}
        events={{ click: videoLink } }/>
      <Entity
        class="store"
        primitive="a-image"
        src="#storebanner"
        width={config.cellWidth}
        height={config.cellContentHeight}
        position={storePos}
        events={{ click: storeLink } }/>
    </Entity>
  )
}

export default Landing
