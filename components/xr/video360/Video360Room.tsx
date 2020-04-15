
import React from 'react'
// @ts-ignore
import { Entity } from 'aframe-react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import VideoControls from './VideoControls'
const ShakaPlayerComp = dynamic(() => import('./ShakaPlayerComp'), { ssr: false })

function Video360Room() {
  const router = useRouter()
  const manifest = router.query.manifest as string

  return (
    <Entity>
      <ShakaPlayerComp manifestUri={manifest}/>
      <Entity
        id="videoPlayerContainer"
      ></Entity>
      <Entity
        primitive="a-videosphere"
        class="videosphere"
        src="#video360Shaka"
        loop="false"
      />
      <VideoControls
        videosrc="#video360Shaka"/>
    </Entity>
  )
}

export default Video360Room
