import React from 'react';
import VideoRecorder from 'react-video-recorder';
import AppHeader from '@xr3ngine/client-core/components/social/Header';

interface VideoProps{
  timeLimit: number;
}

export const VideoRecording = ({timeLimit = 5000}: VideoProps) => {
  return <section style={{height: '100vh', width: '100vw'}}>
      <AppHeader  logo="/assets/logoBlack.png" />    
      <VideoRecorder
        timeLimit={timeLimit}
        isOnInitially
        onRecordingComplete={videoBlob => {
          console.log('videoBlob', videoBlob);
        }}
      />
  </section>;
};

export default VideoRecording;
