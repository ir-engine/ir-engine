import React, { useEffect, useState } from 'react';
import './style.scss';
import './style.scss';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import IconButton from '@material-ui/core/IconButton';
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff
} from '@material-ui/icons';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import {MessageTypes} from "@xr3ngine/engine/src/networking/enums/MessageTypes";


interface ContainerProportions {
    width: number | string;
    height: number | string;
}

interface Props {
    containerProportions?: ContainerProportions;
    peerId?: string;
}

const PartyParticipantWindow = observer((props: Props): JSX.Element => {
    const [videoStream, setVideoStream] = useState(null);
    const [audioStream, setAudioStream] = useState(null);
    const [videoStreamPaused, setVideoStreamPaused] = useState(false);
    const [audioStreamPaused, setAudioStreamPaused] = useState(false);
    const [videoProducerPaused, setVideoProducerPaused] = useState(false);
    const [audioProducerPaused, setAudioProducerPaused] = useState(false);
    const {
        peerId,
    } = props;
    // Video and audio elements' ref
    //   const videoEl = React.createRef<HTMLVideoElement>();
    //   const audioEl = React.createRef<HTMLAudioElement>();
    const videoRef = React.createRef<HTMLVideoElement>();
    const audioRef = React.createRef<HTMLAudioElement>();

    (Network.instance.transport as any).socket.on(MessageTypes.WebRTCPauseConsumer.toString(), (consumerId: string) => {
        console.log(`PartyParticipant listener ${peerId} got consumer pause for ${consumerId}`);
        if (consumerId === videoStream?.id) {
            setVideoProducerPaused(true);
        } else if (consumerId === audioStream?.id) {
            setAudioProducerPaused(true);
        }
    });

    (Network.instance.transport as any).socket.on(MessageTypes.WebRTCResumeConsumer.toString(), (consumerId: string) => {
        console.log(`PartyParticipant listener ${peerId} got consumer resume for ${consumerId}`);
        if (consumerId === videoStream?.id) {
            setVideoProducerPaused(false);
        } else if (consumerId === audioStream?.id) {
            setAudioProducerPaused(false);
        }
    });

    useEffect(() => {
        autorun(() => {
            if (peerId === 'me_cam') {
                setVideoStream(MediaStreamComponent.instance.camVideoProducer);
                setAudioStream(MediaStreamComponent.instance.camAudioProducer);
            } else if (peerId === 'me_screen') {
                setVideoStream(MediaStreamComponent.instance.screenVideoProducer);
                setAudioStream(MediaStreamComponent.instance.screenAudioProducer);
            } else {
                setVideoStream(MediaStreamComponent.instance.consumers.find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-video'));
                setAudioStream(MediaStreamComponent.instance.consumers.find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'));
            }
        });
    }, []);

    useEffect(() => {
        console.log('audioStream or videoStream useEffect triggered')
        if (videoRef.current != null) {
            videoRef.current.id = `${peerId}_video`;
            videoRef.current.autoplay = true;
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
            }
        }

        if (audioRef.current != null) {
            audioRef.current.id = `${peerId}_audio`;
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
            }
            audioRef.current.volume = 0;
        }
    }, [audioStream, videoStream])
    // Add mediasoup integration logic here to feed single peer's stream to these video/audio elements

    useEffect(() => {
        console.log('Videostream paused changed')
        console.log(videoStream?.paused)
    }, [videoStream?.paused])

    const toggleVideo = async () => {
        if (peerId === 'me_cam') {
            await MediaStreamSystem.instance.toggleWebcamVideoPauseState();
            setVideoStreamPaused(videoStream.paused);
        }
        else if (peerId === 'me_screen') {
            await MediaStreamSystem.instance.toggleScreenshareVideoPauseState();
            setVideoStreamPaused(videoStream.paused);
        } else {
            console.log(`Video consumer is paused: ${videoStream.paused}`);
            if (videoStream.paused === false) {
                await (Network.instance.transport as any).pauseConsumer(videoStream);
                setVideoStreamPaused(videoStream.paused);
            }
            else {
                await (Network.instance.transport as any).resumeConsumer(videoStream);
                setVideoStreamPaused(videoStream.paused);
            }
        }
    };

    const toggleAudio = async () => {
        if (peerId === 'me_cam') {
            await MediaStreamSystem.instance.toggleWebcamAudioPauseState();
            setAudioStreamPaused(audioStream.paused);
        }
        else if (peerId === 'me_screen') {
            await MediaStreamSystem.instance.toggleScreenshareAudioPauseState();
            setAudioStreamPaused(audioStream.paused);
        } else {
            if (audioStream.paused === false) {
                await (Network.instance.transport as any).pauseConsumer(audioStream);
                setAudioStreamPaused(audioStream.paused);
            }
            else {
                await (Network.instance.transport as any).resumeConsumer(audioStream);
                setAudioStreamPaused(audioStream.paused);
            }
        }
    };
    return (
        <div
            id={props.peerId + '_container'}
            className={`party-chat-user ${(videoStream && (videoProducerPaused === true || videoStreamPaused === true)) ? 'video-paused': ''} ${(audioStream && (audioProducerPaused === true || audioStreamPaused === true)) ? 'audio-paused': ''}`}
            style={props.containerProportions || {}}
        >
            <div className="user-controls">
                {
                    (videoStream && videoProducerPaused === false && videoStreamPaused === false) &&
                    <IconButton
                        size="small"
                        className="video-control"
                        onClick={toggleVideo}
                    >
                        <Videocam />
                    </IconButton>
                }
                {
                    (videoStream && videoProducerPaused === false && videoStreamPaused === true) &&
                    <IconButton
                        size="small"
                        className="video-control"
                        onClick={toggleVideo}
                    >
                        <VideocamOff />
                    </IconButton>
                }
                {
                    (audioStream && audioProducerPaused === false && audioStream.paused === false) &&
                    <IconButton
                        size="small"
                        className="audio-control"
                        onClick={toggleAudio}
                    >
                        <Mic />
                    </IconButton>
                }
                {
                    (audioStream && audioProducerPaused === false && audioStream.paused === true) &&
                    <IconButton
                        size="small"
                        className="audio-control"
                        onClick={toggleAudio}
                    >
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
