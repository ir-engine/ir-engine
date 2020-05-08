import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import AframeComponentRegisterer from '../aframe/index'

const cellHeight = 0.5
const cellContentHeight = 0.45
const cellWidth = 6

export default function LangingScene (): any {
  return (
    <Scene
      vr-mode-ui="enterVRButton: #enterVRButton"
      class="scene"
      renderer="antialias: true"
      background="color: #FAFAFA"
    >
      <AframeComponentRegisterer />
      <Entity position="0 1.6 0">
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
            thumbnail-url="#spoke"
            cell-height={cellHeight}
            cell-width={cellWidth}
            cell-content-height={cellContentHeight}
            mediatype="landing"
            linktype="external"/>
          <Entity
            primitive="a-media-cell"
            title="vrRoom"
            media-url={'/dream'}
            thumbnail-url="#vrRoom"
            cell-height={cellHeight}
            cell-width={cellWidth}
            cell-content-height={cellContentHeight}
            mediatype="landing"/>
          <Entity
            primitive="a-media-cell"
            title="video360"
            media-url={'/explore'}
            thumbnail-url="#video360banner"
            cell-height={cellHeight}
            cell-width={cellWidth}
            cell-content-height={cellContentHeight}
            mediatype="landing"/>
          <Entity
            primitive="a-media-cell"
            title="store"
            media-url={'curated-x-kai-inc.myshopify.com'}
            thumbnail-url="#storebanner"
            cell-height={cellHeight}
            cell-width={cellWidth}
            cell-content-height={cellContentHeight}
            mediatype="landing"
            linktype="external"/>
        </Entity>
      </Entity>
      <Assets />
      <Player />
      <Environment />
      <a className="enterVR" id="enterVRButton" href="#">
        <SvgVr className="enterVR" />
      </a>
    </Scene>
  )
}
