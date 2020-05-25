import React from 'react'
import { Entity } from 'aframe-react'
import './style.scss'

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
          media-url={'kaixr.world/spoke/'}
          thumbnail-type="glb"
          thumbnail-url="#spokeiconmodel"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          linktype="external"/>
        <Entity
          primitive="a-media-cell"
          title="vrRoom"
          media-url={'/dream'}
          thumbnail-type="glb"
          thumbnail-url="#vrRoomiconmodel"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"/>
        <Entity
          primitive="a-media-cell"
          title="video360"
          media-url={'/explore'}
          thumbnail-type="glb"
          thumbnail-url="#video360iconmodel"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"/>
        <Entity
          primitive="a-media-cell"
          title="store"
          media-url={'curated-x-kai-inc.myshopify.com'}
          thumbnail-type="glb"
          thumbnail-url="#storeiconmodel"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          linktype="external"/>
      </Entity>
    </Entity>
  )
}
