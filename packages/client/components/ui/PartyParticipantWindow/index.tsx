import React from 'react';
import './style.scss';

interface ContainerProportions {
  width: number | string;
  height: number | string;
}

interface Props {
  containerProportions?: ContainerProportions;
}

function PartyParticipantWindow (props: Props): JSX.Element {
  // Video and audio elements' ref
  const videoRef = React.createRef<HTMLVideoElement>();
  const audioRef = React.createRef<HTMLAudioElement>();
  // Add mediasoup integration logic here to feed single peer's stream to these video/audio elements
  return (
    <div className="videoContainer" style={props.containerProportions || {}}>
      <video
        ref={videoRef}
        // className={classnames({
        //   'is-me': isMe,
        //   hidden: !videoVisible || !videoCanPlay,
        //   'network-error':
        //     videoVisible &&
        //     videoMultiLayer &&
        //     consumerCurrentSpatialLayer === null,
        // })}
        autoPlay
        playsInline
        muted
        controls={false}
      />

      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={true}
        controls={false}
      />
    </div>
  );
}

export default PartyParticipantWindow;
