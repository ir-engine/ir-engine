
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
  const title = router.query.title as string

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
      <Entity
        id="player-vr-ui"
        player-vr-ui
      />
      <VideoControls
        videosrc="#video360Shaka" videotext="#videotext" />
      <Entity id="videotext"
        text={{
          font: 'mozillavr',
          width: 2,
          align: 'center',
          baseline: 'center',
          color: 'black',
          transparent: false,
          value: `${title || ''}\n\n(click to play)`
        }}
        position={{ x: 0, y: 2, z: -0.8 }}
      />
    </Entity>
  )
}

export default Video360Room
