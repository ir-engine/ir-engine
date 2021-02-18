import AppHeader from '@xr3ngine/client-core/components/social/Header';
import React from 'react';
import { render } from 'react-dom';
import VideoRecorder from 'react-video-recorder';

interface VideoProps{
  timeLimit: string;
}

export const VideoRecording = ({timeLimit = '5000'}: VideoProps) => {
  return <>
  <AppHeader user={{username:'username'}} logo="/assets/logoBlack.png" />
  <VideoRecorder
    timeLimit={timeLimit}
    onRecordingComplete={videoBlob => {
      // Do something with the video...
      console.log('videoBlob', videoBlob);
    }}
  />
  </>;
};

export default VideoRecording;
