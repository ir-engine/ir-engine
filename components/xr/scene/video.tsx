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
      <Entity
        className="video360Camera"
        camera={{}}
        look-controls={{}}
        position={{ x: 0, y: 1.6, z: 0 }}>
        <Entity
          cursor={{ rayOrigin: isDesktop() ? 'mouse' : 'entity' }}
          raycaster={{ objects: '#video-player-vr-ui,#videotext,#video-controls' }}
          position={{ x: 0, y: 0, z: -0.8 }}/>
      </Entity>
      <Entity
        id="video-controls"
      />
    </Entity>
  )
}
