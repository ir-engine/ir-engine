import React from 'react'
import VideoRecorder from 'react-video-recorder'
import AppHeader from '@xrengine/social/src/components/Header'

interface VideoProps {
  timeLimit: number
}

export const VideoRecording = ({ timeLimit = 5000 }: VideoProps) => {
  return (
    <section style={{ height: '100vh', width: '100vw' }}>
      <AppHeader />
      <VideoRecorder
        timeLimit={timeLimit}
        isOnInitially
        onRecordingComplete={(videoBlob) => {
          console.log('videoBlob', videoBlob)
        }}
      />
    </section>
  )
}

export default VideoRecording
