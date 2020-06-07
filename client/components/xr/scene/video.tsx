import React from 'react'
import { Entity } from 'aframe-react'
import Video360 from '../video360/Video360Room'
import './style.scss'

export interface VideoProps {
  manifest: string
  title: string
  format: string
}

export default function VideoScene(props: VideoProps) {
  return (
    <Entity>
      <Video360
        manifest={props.manifest}
        title={props.title}
        format={props.format} />
      <Entity
        id="video-controls"
        className="clickable"
      />
    </Entity>
  )
}
