import React, { useEffect, useState } from 'react';
import './style.module.scss';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

import {
    Mic,
    MicOff,
    RecordVoiceOver,
    Videocam,
    VideocamOff,
    VoiceOverOff,
    VolumeDown,
    VolumeOff,
    VolumeMute,
    VolumeUp,
} from '@material-ui/icons';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import {MessageTypes} from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { selectAuthState } from '../../../redux/auth/selector';
import { selectLocationState } from '../../../redux/location/selector';
import {connect} from "react-redux";
import {Dispatch} from "redux";


interface ContainerProportions {
    width: number | string;
    height: number | string;
}

interface Props {
    containerProportions?: ContainerProportions;
    peerId?: string;
    authState?: any;
    locationState?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        locationState: selectLocationState(state)
    };
};


const mapDispatchToProps = (dispatch: Dispatch): any => ({});

const PartyParticipantWindow = observer((props: Props): JSX.Element => {
    const [videoStream, setVideoStream] = useState(null);
    const [audioStream, setAudioStream] = useState(null);
    const [videoStreamPaused, setVideoStreamPaused] = useState(false);
    const [audioStreamPaused, setAudioStreamPaused] = useState(false);
    const [videoProducerPaused, setVideoProducerPaused] = useState(false);
    const [audioProducerPaused, setAudioProducerPaused] = useState(false);
    const [videoProducerGlobalMute, setVideoProducerGlobalMute] = useState(false);
    const [audioProducerGlobalMute, setAudioProducerGlobalMute] = useState(false);
    const [volume, setVolume] = useState(0);
    const {
        peerId,
        authState,
        locationState
    } = props;
    const videoRef = React.createRef<HTMLVideoElement>();
    const audioRef = React.createRef<HTMLAudioElement>();

    const user = authState.get('user');
    const currentLocation = locationState.get('currentLocation').get('location');
    const enableGlobalMute = currentLocation.locationType === 'showroom' && user.locationAdmins?.find(locationAdmin => currentLocation.id === locationAdmin.locationId) != null;

    useEffect(() => {
        (Network.instance.transport as any).socket.on(MessageTypes.WebRTCPauseConsumer.toString(), (consumerId: string) => {
            if (consumerId === videoStream?.id) {
                setVideoProducerPaused(true);
            } else if (consumerId === audioStream?.id) {
                setAudioProducerPaused(true);
            }
        });

        (Network.instance.transport as any).socket.on(MessageTypes.WebRTCResumeConsumer.toString(), (consumerId: string) => {
            if (consumerId === videoStream?.id) {
                setVideoProducerPaused(false);
            } else if (consumerId === audioStream?.id) {
                setAudioProducerPaused(false);
            }
        });

        (Network.instance.transport as any).socket.on(MessageTypes.WebRTCPauseProducer.toString(), (producerId: string, globalMute: boolean) => {
            if (producerId === videoStream?.id && globalMute === true) {
                setVideoProducerPaused(true);
                setVideoProducerGlobalMute(true);
            } else if (producerId === audioStream?.id && globalMute === true) {
                setAudioProducerPaused(true);
                setAudioProducerGlobalMute(true);
            }
        });

        (Network.instance.transport as any).socket.on(MessageTypes.WebRTCResumeProducer.toString(), (producerId: string) => {
            if (producerId === videoStream?.id) {
                setVideoProducerPaused(false);
                setVideoProducerGlobalMute(false);
            } else if (producerId === audioStream?.id) {
                setAudioProducerPaused(false);
                setAudioProducerGlobalMute(false);
            }
        });
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
                if (peerId === 'me_cam') {
                    MediaStreamComponent.instance.setVideoPaused(false);
                } else if (peerId === 'me_screen') {
                    MediaStreamComponent.instance.setScreenShareVideoPaused(false);
                } else if (videoStream.track.muted === true) {
                    // toggleVideo();
                }
            }
        }

        if (audioRef.current != null) {
            audioRef.current.id = `${peerId}_audio`;
            audioRef.current.setAttribute('playsinline', 'true');
            audioRef.current.autoplay = true;
            if (peerId === 'me_cam' || peerId === 'me_screen') {
                audioRef.current.muted = true;
            }
            if (audioStream) {
                audioRef.current.srcObject = new MediaStream([audioStream.track.clone()]);
                if (peerId === 'me_cam') {
                    MediaStreamComponent.instance.setAudioPaused(false);
                } else if (peerId === 'me_screen') {
                    MediaStreamComponent.instance.setScreenShareAudioPaused(false);
                } else if (audioStream.track.muted === true) {
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

    const toggleGlobalMute = async () => {
        if (audioProducerGlobalMute === false) {
            await (Network.instance.transport as any).globalMuteProducer({ id: audioStream.producerId });
            setAudioProducerGlobalMute(true);
        } else if (audioProducerGlobalMute === true) {
            await (Network.instance.transport as any).globalUnmuteProducer({ id: audioStream.producerId });
            setAudioProducerGlobalMute(false);
        }
    };

    const adjustVolume = (e, newValue) => {
        if (peerId === 'me_cam' || peerId === 'me_screen') {
            MediaStreamComponent.instance.audioGainNode.gain.setValueAtTime(newValue / 100, MediaStreamComponent.instance.audioGainNode.context.currentTime + 1);
        } else {
            audioRef.current.volume = newValue / 100;
        }
        setVolume(newValue);
    };

    return (
        <div
            id={props.peerId + '_container'}
            className={`party-chat-user ${videoStream == null ? 'no-video' : ''} ${(videoStream && (videoProducerPaused === true || videoStreamPaused === true)) ? 'video-paused': ''} ${(audioStream && (audioProducerPaused === true || audioStreamPaused === true)) ? 'audio-paused': ''}`}
            style={props.containerProportions || {}}
        >
            {
                audioProducerGlobalMute === true && <div className="global-mute">Muted by Admin</div>
            }
            <div className="user-controls">
                <Tooltip title={videoProducerPaused === false && videoStreamPaused === false ? 'Pause Video' : 'Resume Video'}>
                    <IconButton
                        size="small"
                        className="video-control"
                        onClick={toggleVideo}
                        style={{visibility : (videoStream == null || videoProducerPaused === true || videoProducerGlobalMute) ? 'hidden' : 'visible' }}
                    >
                        { (videoStream && videoProducerPaused === false && videoStreamPaused === false) && <Videocam /> }
                        { (videoStream && videoProducerPaused === false && videoStreamPaused === true) && <VideocamOff/> }
                    </IconButton>
                </Tooltip>
                {
                    audioStream && audioProducerPaused === false && audioProducerGlobalMute === false &&
                        <div className="audio-slider">
                            { volume > 0 && <VolumeDown/> }
                            { volume === 0 && <VolumeMute/>}
                            <Slider value={volume} onChange={adjustVolume} aria-labelledby="continuous-slider"/>
                            <VolumeUp/>
                        </div>
                }
                <div className="right-controls">
                    {
                        enableGlobalMute && peerId !== 'me_cam' && peerId !== 'me_screen' && <Tooltip title={audioProducerGlobalMute === false ? 'Mute for everyone' : 'Unmute for everyone'}>
                            <IconButton
                                size="small"
                                className="audio-control"
                                onClick={toggleGlobalMute}
                            >
                                { audioStream && audioProducerGlobalMute === false && <RecordVoiceOver /> }
                                { audioStream && audioProducerGlobalMute === true && <VoiceOverOff /> }
                            </IconButton>
                        </Tooltip>
                    }
                    {
                        enableGlobalMute && peerId !== 'me_cam' && peerId !== 'me_screen' && <div className="spacer"/>
                    }
                    <Tooltip title={(peerId === 'me_cam' || peerId === 'me_screen') && audioStream?.paused === false ? 'Mute me' : (peerId === 'me_cam' || peerId === 'me_screen') && audioStream?.paused === true ? 'Unmute me' : (peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream?.paused === false ? 'Mute this person' : 'Unmute this person' }>
                        <IconButton
                            size="small"
                            className="audio-control"
                            onClick={toggleAudio}
                            style={{visibility : (audioProducerPaused === true || audioProducerGlobalMute === true) ? 'hidden' : 'visible' }}
                        >
                            { ((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === false) && <Mic /> }
                            { ((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === true) && <MicOff /> }
                            { ((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === false) && <VolumeUp /> }
                            { ((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === true) && <VolumeOff /> }
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <video ref={videoRef}/>
            <audio ref={audioRef}/>
        </div>
    );
});

export default connect(mapStateToProps, mapDispatchToProps)(PartyParticipantWindow);
