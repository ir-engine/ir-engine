import React, { useEffect, useState } from 'react';
import styles from './PartyParticipantWindow.module.scss';
import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import { globalMuteProducer, globalUnmuteProducer, pauseConsumer, pauseProducer, resumeConsumer, resumeProducer } from '../../../classes/transports/WebRTCFunctions';

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
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import {MessageTypes} from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import { selectAppState } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { selectLocationState } from '../../../redux/location/selector';
import { selectUserState } from '../../../redux/user/selector';
import {connect} from "react-redux";
import {Dispatch} from "redux";


interface ContainerProportions {
    width: number | string;
    height: number | string;
}

interface Props {
    containerProportions?: ContainerProportions;
    peerId?: string;
    appState?: any;
    authState?: any;
    locationState?: any;
    userState?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        locationState: selectLocationState(state),
        userState: selectUserState(state)
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
    const [focused, setFocused] = useState(false);
    const [volume, setVolume] = useState(0);
    const {
        peerId,
        appState,
        authState,
        locationState,
        userState
    } = props;
    const videoRef = React.createRef<HTMLVideoElement>();
    const audioRef = React.createRef<HTMLAudioElement>();

    const userHasInteracted = appState.get('userHasInteracted');
    const selfUser = authState.get('user');
    const currentLocation = locationState.get('currentLocation').get('location');
    const enableGlobalMute = currentLocation?.locationSettings?.locationType === 'showroom' && selfUser?.locationAdmins?.find(locationAdmin => currentLocation.id === locationAdmin.locationId) != null;
    const user = userState.get('layerUsers').find(user => user.id === peerId);

    autorun(() => {
        (Network.instance?.transport as any)?.socket.on(MessageTypes.WebRTCPauseConsumer.toString(), (consumerId: string) => {
            if (consumerId === videoStream?.id) {
                setVideoProducerPaused(true);
            } else if (consumerId === audioStream?.id) {
                setAudioProducerPaused(true);
            }
        });

        (Network.instance?.transport as any)?.socket.on(MessageTypes.WebRTCResumeConsumer.toString(), (consumerId: string) => {
            if (consumerId === videoStream?.id) {
                setVideoProducerPaused(false);
            } else if (consumerId === audioStream?.id) {
                setAudioProducerPaused(false);
            }
        });

        (Network.instance?.transport as any)?.socket.on(MessageTypes.WebRTCPauseProducer.toString(), (producerId: string, globalMute: boolean) => {
            if (producerId === videoStream?.id && globalMute === true) {
                setVideoProducerPaused(true);
                setVideoProducerGlobalMute(true);
            } else if (producerId === audioStream?.id && globalMute === true) {
                setAudioProducerPaused(true);
                setAudioProducerGlobalMute(true);
            }
        });

        (Network.instance?.transport as any)?.socket.on(MessageTypes.WebRTCResumeProducer.toString(), (producerId: string) => {
            if (producerId === videoStream?.id) {
                setVideoProducerPaused(false);
                setVideoProducerGlobalMute(false);
            } else if (producerId === audioStream?.id) {
                setAudioProducerPaused(false);
                setAudioProducerGlobalMute(false);
            }
        });
    });

    useEffect(() => {
        if (userHasInteracted === true && peerId !== 'me_cam' && peerId !== 'me_screen') {
            videoRef.current?.play();
            audioRef.current?.play();
        }
    }, [userHasInteracted]);

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
        if (audioRef.current != null) {
            audioRef.current.id = `${peerId}_audio`;
            audioRef.current.autoplay = true;
            audioRef.current.setAttribute('playsinline', 'true');
            if (peerId === 'me_cam' || peerId === 'me_screen') {
                audioRef.current.muted = true;
            }
            if (audioStream != null) {
                audioRef.current.srcObject = new MediaStream([audioStream.track.clone()]);
                if(peerId !== 'me_cam'){
                    console.log("*** New mediastream created for audio track for peer id ", peerId);
                    // Create positional audio and attach mediastream here
                    console.log("MediaStreamComponent.instance.consumers is ");
                    console.log(MediaStreamComponent.instance.consumers);
                }
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
    }, [audioStream]);

    useEffect(() => {
        if (videoRef.current != null) {
            videoRef.current.id = `${peerId}_video`;
            videoRef.current.autoplay = true;
            videoRef.current.muted = true;
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
    }, [videoStream]);

    useEffect(() => {
        if (peerId === 'me_cam' || peerId === 'me_screen') setAudioStreamPaused(MediaStreamComponent.instance.audioPaused);
    }, [MediaStreamComponent.instance.audioPaused]);

    useEffect(() => {
        if (peerId === 'me_cam' || peerId === 'me_screen') setVideoStreamPaused(MediaStreamComponent.instance.videoPaused);
    }, [MediaStreamComponent.instance.videoPaused]);

    const toggleVideo = async (e) => {
        e.stopPropagation();
        if (peerId === 'me_cam') {
            const videoPaused = MediaStreamComponent.instance.toggleVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamComponent.instance.camVideoProducer);
            else await resumeProducer(MediaStreamComponent.instance.camVideoProducer);
            setVideoStreamPaused(videoStream.paused);
        }
        else if (peerId === 'me_screen') {
            const videoPaused = MediaStreamComponent.instance.toggleScreenShareVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamComponent.instance.screenVideoProducer);
            else await resumeProducer(MediaStreamComponent.instance.screenVideoProducer);
            setVideoStreamPaused(videoPaused);
        } else {
            if (videoStream.paused === false) {
                await pauseConsumer(videoStream);
                setVideoStreamPaused(videoStream.paused);
            }
            else {
                await resumeConsumer(videoStream);
                setVideoStreamPaused(videoStream.paused);
            }
        }
    };

    const toggleAudio = async (e) => {
        e.stopPropagation();
        if (peerId === 'me_cam') {
            const audioPaused = MediaStreamComponent.instance.toggleAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamComponent.instance.camAudioProducer);
            else await resumeProducer(MediaStreamComponent.instance.camAudioProducer);
            setAudioStreamPaused(audioPaused);
        }
        else if (peerId === 'me_screen') {
            const audioPaused = MediaStreamComponent.instance.toggleScreenShareAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamComponent.instance.screenAudioProducer);
            else await resumeProducer(MediaStreamComponent.instance.screenAudioProducer);
            setAudioStreamPaused(audioPaused);
        } else {
            if (audioStream.paused === false) {
                await pauseConsumer(audioStream);
                setAudioStreamPaused(audioStream.paused);
            }
            else {
                await resumeConsumer(audioStream);
                setAudioStreamPaused(audioStream.paused);
            }
        }
    };

    const toggleGlobalMute = async (e) => {
        e.stopPropagation();
        if (audioProducerGlobalMute === false) {
            await globalMuteProducer({ id: audioStream.producerId });
            setAudioProducerGlobalMute(true);
        } else if (audioProducerGlobalMute === true) {
            await globalUnmuteProducer({ id: audioStream.producerId });
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

    const truncateUsername = () => {
        const name = user?.name;
        if (peerId === 'me_cam') return 'You';
        if (focused === true) return name.length > 20 ? name.slice(0, 20) + '...' : name;
        if (focused === false) return name.length > 10 ? name.slice(0, 10) + '...' : name;
    };

    return (
        <div
            id={peerId + '_container'}
            className={classNames({
                [styles['party-chat-user']]: true,
                [styles['focused']]: focused,
                [styles['self-user']]: peerId === 'me_cam' || peerId === 'me_screen',
                [styles['no-video']]: videoStream == null,
                [styles['video-paused']]: (videoStream && (videoProducerPaused === true || videoStreamPaused === true))
            })}
            style={{ backgroundImage: user?.avatarUrl?.length > 0 ? `url(${user.avatarUrl}` : `url(/placeholders/default-silhouette.svg)`} }
            onClick={() => { if (peerId !== 'me_cam' && peerId !== 'me_screen') setFocused(!focused); } }
        >
            <div className={styles['username']}>{truncateUsername()}</div>
            {
                audioProducerGlobalMute === true && <div className={styles['global-mute']}>Muted by Admin</div>
            }
            <div className={styles['user-controls']}>
                <Tooltip title={videoProducerPaused === false && videoStreamPaused === false ? 'Pause Video' : 'Resume Video'}>
                    <IconButton
                        size="small"
                        className={styles['video-control']}
                        onClick={(e) => toggleVideo(e)}
                        style={{visibility : (videoStream == null || videoProducerPaused === true || videoProducerGlobalMute) ? 'hidden' : 'visible' }}
                    >
                        { (videoStream && videoProducerPaused === false && videoStreamPaused === false) && <Videocam /> }
                        { (videoStream && videoProducerPaused === false && videoStreamPaused === true) && <VideocamOff/> }
                    </IconButton>
                </Tooltip>
                {
                    audioStream && audioProducerPaused === false && audioProducerGlobalMute === false &&
                        <div className={styles['audio-slider']}>
                            { volume > 0 && <VolumeDown/> }
                            { volume === 0 && <VolumeMute/>}
                            <Slider value={volume} onChange={adjustVolume} aria-labelledby="continuous-slider"/>
                            <VolumeUp/>
                        </div>
                }
                <div className={styles['right-controls']}>
                    {
                        enableGlobalMute && peerId !== 'me_cam' && peerId !== 'me_screen' && <Tooltip title={audioProducerGlobalMute === false ? 'Mute for everyone' : 'Unmute for everyone'}>
                            <IconButton
                                size="small"
                                className={styles['audio-control']}
                                onClick={(e) => toggleGlobalMute(e)}
                            >
                                { audioStream && audioProducerGlobalMute === false && <RecordVoiceOver /> }
                                { audioStream && audioProducerGlobalMute === true && <VoiceOverOff /> }
                            </IconButton>
                        </Tooltip>
                    }
                    {
                        enableGlobalMute && peerId !== 'me_cam' && peerId !== 'me_screen' && <div className={styles['spacer']}/>
                    }
                    <Tooltip title={(peerId === 'me_cam' || peerId === 'me_screen') && audioStream?.paused === false ? 'Mute me' : (peerId === 'me_cam' || peerId === 'me_screen') && audioStream?.paused === true ? 'Unmute me' : (peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream?.paused === false ? 'Mute this person' : 'Unmute this person' }>
                        <IconButton
                            size="small"
                            className={styles['audio-control']}
                            onClick={(e) => toggleAudio(e)}
                            style={{visibility : (audioStream == null || audioProducerPaused === true || audioProducerGlobalMute === true) ? 'hidden' : 'visible' }}
                        >
                            { ((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStreamPaused === false) && <Mic /> }
                            { ((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStreamPaused === true) && <MicOff /> }
                            { ((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === false) && <VolumeUp /> }
                            { ((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === true) && <VolumeOff /> }
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <video key={peerId + '_cam'} ref={videoRef}/>
            <audio key={peerId + '_audio'} ref={audioRef}/>
        </div>
    );
});

export default connect(mapStateToProps, mapDispatchToProps)(PartyParticipantWindow);
