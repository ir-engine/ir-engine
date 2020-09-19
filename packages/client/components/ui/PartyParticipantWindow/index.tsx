import React, { useEffect, useState } from 'react';
import './style.scss';
import './style.scss';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';

import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
    VolumeDown,
    VolumeOff,
    VolumeMute,
    VolumeUp,
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
    const [volume, setVolume] = useState(0);
    const {
        peerId,
    } = props;
    // Video and audio elements' ref
    //   const videoEl = React.createRef<HTMLVideoElement>();
    //   const audioEl = React.createRef<HTMLAudioElement>();
    const videoRef = React.createRef<HTMLVideoElement>();
    const audioRef = React.createRef<HTMLAudioElement>();

    useEffect(() => {
        (Network.instance.transport as any).socket.on(MessageTypes.WebRTCPauseConsumer.toString(), (consumerId: string) => {
            console.log(`PartyParticipant listener ${peerId} got consumer pause for ${consumerId}`);
            console.log('This videostream id: ' + videoStream?.id);
            if (consumerId === videoStream?.id) {
                setVideoProducerPaused(true);
            } else if (consumerId === audioStream?.id) {
                setAudioProducerPaused(true);
            }
        });

        (Network.instance.transport as any).socket.on(MessageTypes.WebRTCResumeConsumer.toString(), (consumerId: string) => {
            console.log(`PartyParticipant listener ${peerId} got consumer resume for ${consumerId}`);
            console.log('This videostream id: ' + videoStream?.id);
            if (consumerId === videoStream?.id) {
                setVideoProducerPaused(false);
            } else if (consumerId === audioStream?.id) {
                setAudioProducerPaused(false);
            }
        });

        // return () => {
        //     console.log('Removing socket listeners')
        //     if (typeof (Network.instance.transport as any).socket.off === 'function') {
        //         (Network.instance.transport as any).socket.off(MessageTypes.WebRTCPauseConsumer.toString());
        //         (Network.instance.transport as any).socket.off(MessageTypes.WebRTCResumeConsumer.toString());
        //     }
        // };
    }, [videoStream, audioStream]);

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
                } else if (videoStream.track.muted === true) {
                    console.log('Starting video in paused state');
                    // toggleVideo();
                }
            }
        }

        if (audioRef.current != null) {
            audioRef.current.id = `${peerId}_audio`;
            audioRef.current.setAttribute('playsinline', 'true');
            audioRef.current.autoplay = true;
            if (peerId === 'me_cam' || peerId === 'me_screen') {
                console.log('Muting self audio');
                audioRef.current.muted = true;
            }
            if (audioStream) {
                audioRef.current.srcObject = new MediaStream([audioStream.track.clone()]);
                // audioEl.mediaStream = audioStream;
                if (peerId === 'me_cam') {
                    MediaStreamComponent.instance.setAudioPaused(false);
                } else if (peerId === 'me_screen') {
                    MediaStreamComponent.instance.setScreenShareAudioPaused(false);
                } else if (audioStream.track.muted === true) {
                    console.log('Starting audio in paused state');
                    // toggleAudio();
                }
            }
            audioRef.current.volume = 1;
            setVolume(100);
        }
    }, [audioStream, videoStream]);
    // Add mediasoup integration logic here to feed single peer's stream to these video/audio elements

    const toggleVideo = async () => {
        if (peerId === 'me_cam') {
            await MediaStreamSystem.instance.toggleWebcamVideoPauseState();
            setVideoStreamPaused(videoStream.paused);
        }
        else if (peerId === 'me_screen') {
            await MediaStreamSystem.instance.toggleScreenshareVideoPauseState();
            setVideoStreamPaused(videoStream.paused);
        } else {
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

    const adjustVolume = (e, newValue) => {
        console.log(newValue);
        if (peerId === 'me_cam' || peerId === 'me_screen') {
            console.log('Setting local gain');
            console.log(MediaStreamComponent.instance.audioGainNode);
            console.log(MediaStreamComponent.instance.audioGainNode.gain);
            MediaStreamComponent.instance.audioGainNode.gain.setValueAtTime(newValue / 100, MediaStreamComponent.instance.audioGainNode.context.currentTime + 1);
            console.log('AFTER GAIN:');
            console.log(MediaStreamComponent.instance.audioGainNode.gain);
        } else {
            console.log('Setting audio component value');
            audioRef.current.volume = newValue / 100;
        }
        setVolume(newValue);
    };

    return (
        <div
            id={props.peerId + '_container'}
            className={`party-chat-user ${(videoStream && (videoProducerPaused === true || videoStreamPaused === true)) ? 'video-paused': ''} ${(audioStream && (audioProducerPaused === true || audioStreamPaused === true)) ? 'audio-paused': ''}`}
            style={props.containerProportions || {}}
        >
            <div className="user-controls">
                <IconButton
                    size="small"
                    className="video-control"
                    onClick={toggleVideo}
                    style={{visibility : videoProducerPaused ? 'hidden' : 'visible' }}
                >
                    { (videoStream && videoProducerPaused === false && videoStreamPaused === false) && <Videocam /> }
                    { (videoStream && videoProducerPaused === false && videoStreamPaused === true) && <VideocamOff/> }
                </IconButton>
                {
                    audioStream && audioProducerPaused === false &&
                        <div className="audio-slider">
                            { volume > 0 && <VolumeDown/> }
                            { volume === 0 && <VolumeMute/>}
                            <Slider value={volume} onChange={adjustVolume} aria-labelledby="continuous-slider"/>
                            <VolumeUp/>
                        </div>
                }
                <IconButton
                    size="small"
                    className="audio-control"
                    onClick={toggleAudio}
                    style={{visibility : audioProducerPaused ? 'hidden' : 'visible' }}
                >
                    { ((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === false) && <Mic /> }
                    { ((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === true) && <MicOff /> }
                    { ((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === false) && <VolumeUp /> }
                    { ((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === true) && <VolumeOff /> }
                </IconButton>
            </div>
            <video ref={videoRef}/>
            <audio ref={audioRef}/>
        </div>
    );
});

export default PartyParticipantWindow;
