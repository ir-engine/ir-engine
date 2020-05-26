import React from 'react'
import { Entity } from 'aframe-react'
import './style.scss'

import { getSourceType } from './assets'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.landing

const cellHeight = config.cellHeight
const cellContentHeight = config.cellContentHeight
const cellWidth = config.cellWidth

const x = config.offset.x
const y = config.offset.y
const z = config.offset.z
const pos = x + ' ' + y + ' ' + z

export default function LandingScene (): any {
  return (
    <Entity position={pos}>
      <Entity
        primitive="a-grid"
        rows={4}
        columns={1}
        cell-height={cellHeight}
        cell-width={cellWidth}
        cell-content-height={cellContentHeight}>
        <Entity
          primitive="a-media-cell"
          title="spoke"
          media-url={config.spoke.link}
          thumbnail-type={getSourceType(config.spoke.src)}
          thumbnail-url="#spokeBanner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          linktype="external"/>
        <Entity
          primitive="a-media-cell"
          title="vrRoom"
          media-url={config.vrRoom.link}
          thumbnail-type={getSourceType(config.vrRoom.src)}
          thumbnail-url="#vrRoomBanner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"/>
        <Entity
          primitive="a-media-cell"
          title="video360"
          media-url={config.video360.link}
          thumbnail-type={getSourceType(config.video360.src)}
          thumbnail-url="#video360Banner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"/>
        <Entity
          primitive="a-media-cell"
          title="store"
          media-url={config.store.link}
          thumbnail-type={getSourceType(config.store.src)}
          thumbnail-url="#storeBanner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          linktype="external"/>
      </Entity>
    </Entity>
  )
}
