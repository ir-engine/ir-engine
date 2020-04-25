import React, { useState } from 'react'
import { useRouter } from 'next/router'
import './VideoControls.scss'

interface VideoControllerProps {
  videosrc: string,
  videotext: string
}

function Video360Room(props: VideoControllerProps): any {
  const router = useRouter()
  const [playing, setPlaying] = useState(false)
  const [end, setEnd] = useState(false)

  function clickHandler() {
    if (end) {
      exitVideoHandler()
    } else if (!playing) {
      playHandler(props.videosrc, props.videotext)
    }
  }

  function playHandler(videosrc: string, videotext: string) {
    const video = document.querySelector(videosrc) as HTMLElement
    const textEl = document.querySelector(videotext)
    if (video && video !== undefined && video.getAttribute('src') !== '') {
      (video as HTMLVideoElement).play()
      const controller = document.querySelector('#videoplayercontrols')
      controller.classList.remove('active')
      controller.classList.add('disabled')
      textEl.object3D.visible = false
      video.addEventListener('complete', videoEndHandler, { once: true })
      setPlaying(true)
    } else console.log('this.video is undefined')
  }

  function videoEndHandler() {
    console.log('videoEndHandler')
    const video = document.querySelector(props.videosrc)
    const textEl = document.querySelector(props.videotext)
    if (video && video !== undefined && video.getAttribute('src') !== '') {
      video.pause()
      const controller = document.querySelector('#videoplayercontrols')
      textEl.addEventListener('click', exitVideoHandler)
      controller.classList.remove('disabled')
      controller.classList.add('active')
      textEl.setAttribute('text', { value: 'END\n\nclick to exit' })
      textEl.object3D.visible = true
      setEnd(true)
      setPlaying(false)
    } else console.log('this.video is undefined')
  }

  function exitVideoHandler() {
    router.push('/videoGrid')
  }

  return (
    <div onClick={ clickHandler }
      id="videoplayercontrols"
      className="videoplayercontrols active">
    </div>
  )
}

export default Video360Room
