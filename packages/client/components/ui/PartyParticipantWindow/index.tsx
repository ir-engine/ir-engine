import React, { useEffect, useState } from 'react';
import './style.scss';
import './style.scss';import { observer } from 'mobx-react';


interface ContainerProportions {
  width: number | string;
  height: number | string;
}

interface Props {
  containerProportions?: ContainerProportions;
  videoStream?: any;
  audioStream?: any;
  peerId?: string;
}

const PartyParticipantWindow = observer((props: Props): JSX.Element => {
    const {
        audioStream,
        peerId,
        videoStream
    } = props;
    const [audioState, setAudioState] = useState(null);
    const [audioCanPlay, setAudioCanPlay] = useState(false);
    const [audioPaused, setAudioPaused] = useState(true);
    const [videoState, setVideoState] = useState(null);
    const [videoCanPlay, setVideoCanPlay] = useState(false);
    const [videoPaused, setVideoPaused] = useState(true);
  // Video and audio elements' ref
  //   const videoEl = React.createRef<HTMLVideoElement>();
  //   const audioEl = React.createRef<HTMLAudioElement>();
    const videoEl = document.createElement('video');
    const audioEl = document.createElement('audio');

    useEffect(() => {
        videoEl.id = `${peerId}_video`;
        audioEl.id = `${peerId}_audio`;

        console.log('videoState:');
        console.log(videoState);
        console.log('audioState:');
        console.log(audioState);

        videoEl.setAttribute('autoplay', 'true');
        videoEl.setAttribute('playsinline', 'true');
        console.log('Checking to see if we should assign and start video stream');
        console.log(`videoState is null?: ${videoState == null}`);
        console.log('videoStream:');
        console.log(videoStream);
        if (videoStream) {
            videoEl.srcObject = new MediaStream([videoStream.track.clone()]);
            // videoEl.mediaStream = videoStream;
            setVideoState(videoEl);
            console.log('Playing video');
            // console.log((videoEl as any).current.mediaStream);
            console.log(videoEl.srcObject);
            document.getElementById(props.peerId + '_container').appendChild(videoEl);
            // videoEl.current.play().catch((err) => {
            //     console.log('Video play error');
            //     console.log(err);
            // });
        }

        audioEl.setAttribute('playsinline', 'true');
        audioEl.setAttribute('autoplay', 'true');
        audioEl.setAttribute('muted', 'false');
        if (audioStream) {
            audioEl.srcObject = new MediaStream([audioStream.track.clone()]);
            // audioEl.mediaStream = audioStream;
            setAudioState(audioEl);
            document.getElementById(props.peerId + '_container').appendChild(audioEl);
            // audioEl.current.play().catch((err) => {
            //     console.log('Audio play error');
            //     console.log(err);
            // });
        }
        audioEl.volume = 0;
    }, []);
  // Add mediasoup integration logic here to feed single peer's stream to these video/audio elements
  return (
    <div className="videoContainer" id={props.peerId + '_container'} style={props.containerProportions || {}}>
        {/*{ videoStream && videoEl }*/}
        {/*{ audioStream && audioEl }*/}
    </div>
  );
});

export default PartyParticipantWindow;
