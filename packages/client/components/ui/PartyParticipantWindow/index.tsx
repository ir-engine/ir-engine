import React, { useEffect, useState } from 'react';
import './style.scss';
import './style.scss';import { observer } from 'mobx-react';
import IconButton from '@material-ui/core/IconButton';
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff
} from '@material-ui/icons';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';


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
  // Video and audio elements' ref
  //   const videoEl = React.createRef<HTMLVideoElement>();
  //   const audioEl = React.createRef<HTMLAudioElement>();
    const videoRef = React.createRef<HTMLVideoElement>();
    const audioRef = React.createRef<HTMLAudioElement>();

    useEffect(() => {
        videoRef.current.id = `${peerId}_video`;
        audioRef.current.id = `${peerId}_audio`;

        videoRef.current.autoplay =true;
        videoRef.current.setAttribute('playsinline', 'true');
        if (videoStream) {
            videoRef.current.srcObject = new MediaStream([videoStream.track.clone()]);
            // videoEl.mediaStream = videoStream;
            console.log('Playing video');
            if (peerId === 'me_cam') {
                MediaStreamComponent.instance.setVideoPaused(false);
            } else if (peerId === 'me_screen') {
                MediaStreamComponent.instance.setScreenShareVideoPaused(false);
            }
            // console.log((videoEl as any).current.mediaStream);
            // videoEl.current.play().catch((err) => {
            //     console.log('Video play error');
            //     console.log(err);
            // });
        }

        audioRef.current.setAttribute('playsinline', 'true');
        audioRef.current.autoplay = true;
        audioRef.current.muted = false;
        if (audioStream) {
            audioRef.current.srcObject = new MediaStream([audioStream.track.clone()]);
            // audioEl.mediaStream = audioStream;
            if (peerId === 'me_cam') {
                MediaStreamComponent.instance.setAudioPaused(false);
            } else if (peerId === 'me_screen') {
                MediaStreamComponent.instance.setScreenShareAudioPaused(false);
            }
            // audioEl.current.play().catch((err) => {
            //     console.log('Audio play error');
            //     console.log(err);
            // });
        }
        audioRef.current.volume = 0;
    }, []);
  // Add mediasoup integration logic here to feed single peer's stream to these video/audio elements

    const toggleVideo = () => {
        console.log('Toggling video')
        if (peerId === 'me_cam') {
            MediaStreamSystem.instance.toggleWebcamVideoPauseState();
        }
        else if (peerId === 'me_screen') {
            MediaStreamSystem.instance.toggleScreenshareVideoPauseState();
        } else {
            const consumer = MediaStreamComponent.instance.consumers.find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'video');
            console.log(`Need to toggle consumer video for ${peerId}`)
            console.log(consumer)
        }
    };

    const toggleAudio = () => {
        console.log('Toggling audio')
        if (peerId === 'me_cam') {
            MediaStreamSystem.instance.toggleWebcamAudioPauseState();
        }
        else if (peerId === 'me_screen') {
            MediaStreamSystem.instance.toggleScreenshareAudioPauseState();
        } else {
            const consumer = MediaStreamComponent.instance.consumers.find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'audio');
            console.log(`Need to toggle consumer audio for ${peerId}`)
            console.log(consumer)
        }
    };
  return (
    <div className="party-chat-user" id={props.peerId + '_container'} style={props.containerProportions || {}}>
        <div className="user-controls">
            { (peerId === 'me_cam' && MediaStreamComponent.instance.videoPaused === false) &&
                <IconButton size="small" onClick={toggleVideo}>
                    <Videocam />
                </IconButton>
            }
            { (peerId === 'me_cam' && MediaStreamComponent.instance.videoPaused === true) &&
                <IconButton size="small" onClick={toggleVideo}>
                    <VideocamOff />
                </IconButton>
            }
            { (peerId === 'me_cam' && MediaStreamComponent.instance.audioPaused === false) &&
                <IconButton size="small" onClick={toggleAudio}>
                    <Mic />
                </IconButton>
            }
            { (peerId === 'me_cam' && MediaStreamComponent.instance.audioPaused === true) &&
                <IconButton size="small" onClick={toggleAudio}>
                    <MicOff />
                </IconButton>
            }
        </div>
        <video ref={videoRef}/>
        <audio ref={audioRef}/>
    </div>
  );
});

export default PartyParticipantWindow;
