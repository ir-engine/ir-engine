import React from 'react'
import { Entity } from 'aframe-react'
import AFRAME from 'aframe'
import Video360 from '../video360/Video360Room'
import './style.scss'

export interface VideoProps {
  manifest: string
  title: string
  format: string
}

export default function VideoScene(props: VideoProps) {
  function isDesktop() {
    const mobile = AFRAME.utils.device.isMobile()
    const headset = AFRAME.utils.device.checkHeadsetConnected()
    return !(mobile) && !(headset)
  }

  return (
    <Entity>
      <Video360
        manifest={props.manifest}
        title={props.title}
        format={props.format} />
      <Entity camera={{}} look-controls={{}} position={{ x: 0, y: 1.6, z: 0 }} className="video360Camera">
        <Entity visible={ !isDesktop() } cursor={{ rayOrigin: isDesktop() ? 'mouse' : 'entity' }}
          raycaster={{ objects: '#video-player-vr-ui,#videotext' }}
          position={{ x: 0, y: 0, z: -0.8 }} geometry={{ primitive: 'ring', radiusInner: 0.01, radiusOuter: 0.02 }}
          material={{ shader: 'flat', color: 'red' }} />
      </Entity>
    </Entity>
  )
}
