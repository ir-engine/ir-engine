import React, { useEffect } from 'react';
import './style.scss';

interface ContainerProportions {
  width: number | string;
  height: number | string;
}

interface Props {
  containerProportions?: ContainerProportions;
  videoStream?: any;
  audioStream?: any;
  peerId?: string
}

function PartyParticipantWindow (props: Props): JSX.Element {
    const {
        audioStream,
        peerId,
        videoStream
    } = props;
  // Video and audio elements' ref
    let videoEl = React.createRef<HTMLVideoElement>();
    let audioEl = React.createRef<HTMLAudioElement>();

    useEffect(() => {
        videoEl.current.id = `${peerId}_video`;
        videoEl.current.autoplay = true;
        videoEl.current.setAttribute('playsinline', 'true');
        videoEl.current.setAttribute('controls', 'false')
        if (videoStream) {
            videoEl.current.srcObject = new MediaStream([videoStream.track.clone()]);
            (videoEl as any).current.mediaStream = videoStream;
            videoEl.current.play().catch((err) => {
                console.log('Video play error')
                console.log(err)
            })
        }

        audioEl.current.id = `${peerId}_audio`;
        audioEl.current.setAttribute('playsinline', 'true');
        audioEl.current.setAttribute('autoplay', 'true');
        audioEl.current.setAttribute('controls', 'false')
        audioEl.current.setAttribute('muted', 'false')
        if (audioStream) {
            audioEl.current.srcObject = new MediaStream([audioStream.track.clone()]);
            (audioEl as any).current.mediaStream = audioStream;
            audioEl.current.play().catch((err) => {
                console.log('Audio play error')
                console.log(err)
            })
        }
        audioEl.current.volume = 0;
    })
  // Add mediasoup integration logic here to feed single peer's stream to these video/audio elements
  return (
    <div className="videoContainer" style={props.containerProportions || {}}>
        <video
            ref={videoEl}
            autoPlay
            playsInline
            muted
            controls={false}
        />
        <audio
            ref={audioEl}
            autoPlay
            playsInline
            muted={true}
            controls={false}
        />
    </div>
  );
}

export default PartyParticipantWindow;
