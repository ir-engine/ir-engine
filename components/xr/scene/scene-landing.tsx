import React from 'react'
// @ts-ignore
import { Scene, Entity } from 'aframe-react'
import Assets from './assets'
import Environment from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import AframeComponentRegisterer from '../aframe/index'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.landing

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
          cell-height={config.cellHeight}
          cell-width={config.cellWidth}
          cell-content-height={config.cellContentHeight}>
          <Entity
            primitive="a-media-cell"
            title="spoke"
            media-url=""
            thumbnail-url="#spoke"
            cell-height={config.cellHeight}
            cell-width={config.cellWidth}
            cell-content-height={config.cellContentHeight}
            mediatype="landing"/>
          <Entity
            primitive="a-media-cell"
            title="vrRoom"
            media-url="/dream"
            thumbnail-url="#vrRoom"
            cell-height={config.cellHeight}
            cell-width={config.cellWidth}
            cell-content-height={config.cellContentHeight}
            mediatype="landing"/>
          <Entity
            primitive="a-media-cell"
            title="video360"
            media-url="/explore"
            thumbnail-url="#video360banner"
            cell-height={config.cellHeight}
            cell-width={config.cellWidth}
            cell-content-height={config.cellContentHeight}
            mediatype="landing"/>
          <Entity
            primitive="a-media-cell"
            title="store"
            media-url={config.store.link}
            thumbnail-url="#storebanner"
            cell-height={config.cellHeight}
            cell-width={config.cellWidth}
            cell-content-height={config.cellContentHeight}
            mediatype="landing"/>
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
