import React from 'react'
import { Entity } from 'aframe-react'
import './style.scss'

import { getSourceType } from './assets'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.landing
const video360 = getConfig().publicRuntimeConfig.xr.video360
const vrRoom = getConfig().publicRuntimeConfig.xr.vrRoom
const spoke = getConfig().publicRuntimeConfig.xr.spoke
const store = getConfig().publicRuntimeConfig.xr.store

const cellHeight = config.cellHeight
const cellContentHeight = config.cellContentHeight
const cellWidth = config.cellWidth

const x = config.offset.x
const y = config.offset.y
const z = config.offset.z
const pos = x + ' ' + y + ' ' + z

const comingSoon = {
  width: 1.6,
  height: 0.425,
  opacity: 0.7,
  pos: '0 0 0.1025'
}

export default function LandingScene (): any {
  return (
    <Entity position={pos}>
      <Entity
        id="landing-grid"
        primitive="a-grid"
        rows={4}
        columns={1}
        cell-height={cellHeight}
        cell-width={cellWidth}
        cell-content-height={cellContentHeight}>
        <Entity
          primitive="a-media-cell"
          title="video360"
          media-url={video360.link}
          thumbnail-type={getSourceType(video360.src)}
          thumbnail-url="#video360Banner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          link-enabled={!video360.comingSoon.enabled}>
          { video360.comingSoon.enabled &&
              <Entity
                position={comingSoon.pos}
                primitive="a-image"
                src={video360.comingSoon.src}
                opacity={comingSoon.opacity}
                width={comingSoon.width}
                height={comingSoon.height}
              />
          }
        </Entity>
        <Entity
          primitive="a-media-cell"
          title="vrRoom"
          media-url={vrRoom.link}
          thumbnail-type={getSourceType(vrRoom.src)}
          thumbnail-url="#vrRoomBanner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          link-enabled={!vrRoom.comingSoon.enabled}>
          { vrRoom.comingSoon.enabled &&
              <Entity
                position={comingSoon.pos}
                primitive="a-image"
                src={vrRoom.comingSoon.src}
                opacity={comingSoon.opacity}
                width={comingSoon.width}
                height={comingSoon.height}
              />
          }
        </Entity>
        <Entity
          primitive="a-media-cell"
          title="spoke"
          media-url={spoke.link}
          thumbnail-type={getSourceType(spoke.src)}
          thumbnail-url="#spokeBanner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          linktype="external"
          link-enabled={!spoke.comingSoon.enabled}>
          { spoke.comingSoon.enabled &&
              <Entity
                position={comingSoon.pos}
                primitive="a-image"
                src={spoke.comingSoon.src}
                opacity={comingSoon.opacity}
                width={comingSoon.width}
                height={comingSoon.height}
              />
          }
        </Entity>
        <Entity
          primitive="a-media-cell"
          title="store"
          media-url={store.link}
          thumbnail-type={getSourceType(store.src)}
          thumbnail-url="#storeBanner"
          cell-height={cellHeight}
          cell-width={cellWidth}
          cell-content-height={cellContentHeight}
          mediatype="landing"
          linktype="external"
          link-enabled={!store.comingSoon.enabled}>
          { store.comingSoon.enabled &&
              <Entity
                position={comingSoon.pos}
                primitive="a-image"
                src={store.comingSoon.src}
                opacity={comingSoon.opacity}
                width={comingSoon.width}
                height={comingSoon.height}
              />
          }
        </Entity>
      </Entity>
    </Entity>
  )
}
