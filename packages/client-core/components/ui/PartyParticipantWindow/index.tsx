import React, {useEffect, useState} from 'react';
import styles from './PartyParticipantWindow.module.scss';
import {autorun} from 'mobx';
import {observer} from 'mobx-react';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import {
    globalMuteProducer,
    globalUnmuteProducer,
    pauseConsumer,
    pauseProducer,
    resumeConsumer,
    resumeProducer
} from '@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions';

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
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';
import {Network} from "@xr3ngine/engine/src/networking/classes/Network";
import {MessageTypes} from "@xr3ngine/engine/src/networking/enums/MessageTypes";
import {selectAppState} from '../../../redux/app/selector';
import {selectAuthState} from '../../../redux/auth/selector';
import {selectLocationState} from '../../../redux/location/selector';
import {selectUserState} from '../../../redux/user/selector';
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {PositionalAudioSystem} from "@xr3ngine/engine/src/audio/systems/PositionalAudioSystem";


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
    const [volume, setVolume] = useState(100);
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
        if (typeof (Network.instance?.transport as any)?.socket?.on === 'function') {
            (Network.instance?.transport as any)?.socket?.on(MessageTypes.WebRTCPauseConsumer.toString(), (consumerId: string) => {
                if (consumerId === videoStream?.id) {
                    setVideoProducerPaused(true);
                } else if (consumerId === audioStream?.id) {
                    setAudioProducerPaused(true);
                }
            });

            (Network.instance?.transport as any)?.socket?.on(MessageTypes.WebRTCResumeConsumer.toString(), (consumerId: string) => {
                if (consumerId === videoStream?.id) {
                    setVideoProducerPaused(false);
                } else if (consumerId === audioStream?.id) {
                    setAudioProducerPaused(false);
                }
            });

            (Network.instance?.transport as any)?.socket?.on(MessageTypes.WebRTCPauseProducer.toString(), (producerId: string, globalMute: boolean) => {
                if (producerId === videoStream?.id && globalMute === true) {
                    setVideoProducerPaused(true);
                    setVideoProducerGlobalMute(true);
                } else if (producerId === audioStream?.id && globalMute === true) {
                    setAudioProducerPaused(true);
                    setAudioProducerGlobalMute(true);
                }
            });

            (Network.instance?.transport as any)?.socket?.on(MessageTypes.WebRTCResumeProducer.toString(), (producerId: string) => {
                if (producerId === videoStream?.id) {
                    setVideoProducerPaused(false);
                    setVideoProducerGlobalMute(false);
                } else if (producerId === audioStream?.id) {
                    setAudioProducerPaused(false);
                    setAudioProducerGlobalMute(false);
                }
            });
        }
    });

    useEffect(() => {
        if (userHasInteracted === true && peerId !== 'me_cam' && peerId !== 'me_screen') {
            videoRef.current?.play();
            audioRef.current?.play();
        }
    }, [userHasInteracted]);

    useEffect(() => {
        if ((selfUser?.user_setting?.spatialAudioEnabled === true || selfUser?.user_setting?.spatialAudioEnabled === 1) && audioRef.current != null) audioRef.current.volume = 0;
        else if ((selfUser?.user_setting?.spatialAudioEnabled === false || selfUser?.user_setting?.spatialAudioEnabled === 0) && PositionalAudioSystem.instance != null) audioRef.current.volume = volume / 100;
    }, [selfUser]);

    useEffect(() => {
        autorun(() => {
            if (peerId === 'me_cam') {
                setVideoStream(MediaStreamSystem.instance?.camVideoProducer);
                setAudioStream(MediaStreamSystem.instance?.camAudioProducer);
            } else if (peerId === 'me_screen') {
                setVideoStream(MediaStreamSystem.instance.screenVideoProducer);
                setAudioStream(MediaStreamSystem.instance.screenAudioProducer);
            } else {
                setVideoStream(MediaStreamSystem.instance.consumers?.find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-video'));
                setAudioStream(MediaStreamSystem.instance.consumers?.find((c: any) => c.appData.peerId === peerId && c.appData.mediaTag === 'cam-audio'));
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
                if (peerId !== 'me_cam') {
                    console.log("*** New mediastream created for audio track for peer id ", peerId);
                    // Create positional audio and attach mediastream here
                    console.log("MediaStreamSystem.instance?.consumers is ");
                    console.log(MediaStreamSystem.instance?.consumers);
                }
                if (peerId === 'me_cam') {
                    MediaStreamSystem.instance.setAudioPaused(false);
                } else if (peerId === 'me_screen') {
                    MediaStreamSystem.instance.setScreenShareAudioPaused(false);
                } else if (audioStream.track.muted === true) {
                    // toggleAudio();
                }
                setAudioProducerPaused(false);
            }
            // TODO: handle 3d audio switch on/off
            if (selfUser?.user_setting?.spatialAudioEnabled === true || selfUser?.user_setting?.spatialAudioEnabled === 1) audioRef.current.volume = 0;
            if (selfUser?.user_setting?.spatialAudioEnabled === false || selfUser?.user_setting?.spatialAudioEnabled === 0 && PositionalAudioSystem.instance != null) {
                audioRef.current.volume = volume / 100;
                PositionalAudioSystem.instance?.suspend();
            }
            setVolume(volume);
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
                    MediaStreamSystem.instance.setVideoPaused(false);
                } else if (peerId === 'me_screen') {
                    MediaStreamSystem.instance.setScreenShareVideoPaused(false);
                } else if (videoStream.track.muted === true) {
                    // toggleVideo();
                }
                setVideoProducerPaused(false);
            }
        }
    }, [videoStream]);

    useEffect(() => {
        if (peerId === 'me_cam' || peerId === 'me_screen') setAudioStreamPaused(MediaStreamSystem.instance?.audioPaused);
    }, [MediaStreamSystem.instance?.audioPaused]);

    useEffect(() => {
        if (peerId === 'me_cam' || peerId === 'me_screen') setVideoStreamPaused(MediaStreamSystem.instance?.videoPaused);
    }, [MediaStreamSystem.instance?.videoPaused]);

    const toggleVideo = async (e) => {
        e.stopPropagation();
        if (peerId === 'me_cam') {
            const videoPaused = MediaStreamSystem.instance.toggleVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamSystem.instance?.camVideoProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camVideoProducer);
            setVideoStreamPaused(videoStream.paused);
        } else if (peerId === 'me_screen') {
            const videoPaused = MediaStreamSystem.instance.toggleScreenShareVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamSystem.instance.screenVideoProducer);
            else await resumeProducer(MediaStreamSystem.instance.screenVideoProducer);
            setVideoStreamPaused(videoPaused);
        } else {
            if (videoStream.paused === false) {
                await pauseConsumer(videoStream);
                setVideoStreamPaused(videoStream.paused);
            } else {
                await resumeConsumer(videoStream);
                setVideoStreamPaused(videoStream.paused);
            }
        }
    };

    const toggleAudio = async (e) => {
        e.stopPropagation();
        if (peerId === 'me_cam') {
            const audioPaused = MediaStreamSystem.instance.toggleAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamSystem.instance?.camAudioProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camAudioProducer);
            setAudioStreamPaused(audioPaused);
        } else if (peerId === 'me_screen') {
            const audioPaused = MediaStreamSystem.instance.toggleScreenShareAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamSystem.instance.screenAudioProducer);
            else await resumeProducer(MediaStreamSystem.instance.screenAudioProducer);
            setAudioStreamPaused(audioPaused);
        } else {
            if (audioStream.paused === false) {
                await pauseConsumer(audioStream);
                setAudioStreamPaused(audioStream.paused);
            } else {
                await resumeConsumer(audioStream);
                setAudioStreamPaused(audioStream.paused);
            }
        }
    };

    const toggleGlobalMute = async (e) => {
        e.stopPropagation();
        if (audioProducerGlobalMute === false) {
            await globalMuteProducer({id: audioStream.producerId});
            setAudioProducerGlobalMute(true);
        } else if (audioProducerGlobalMute === true) {
            await globalUnmuteProducer({id: audioStream.producerId});
            setAudioProducerGlobalMute(false);
        }
    };

    const adjustVolume = (e, newValue) => {
        if (peerId === 'me_cam' || peerId === 'me_screen') {
            MediaStreamSystem.instance.audioGainNode.gain.setValueAtTime(newValue / 100, MediaStreamSystem.instance.audioGainNode.context.currentTime + 1);
        } else {
            audioRef.current.volume = newValue / 100;
        }
        setVolume(newValue);
    };

    const truncateUsername = () => {
        const name = user?.name;
        if (peerId === 'me_cam') return 'You';
        if (focused === true) return name?.length > 20 ? name.slice(0, 20) + '...' : name;
        if (focused === false) return name?.length > 10 ? name.slice(0, 10) + '...' : name;
    };

    const avatarBgImage = user && user.avatarId ?
        `url(${'/static/' + user.avatarId.toLocaleLowerCase() + '.png'})` : selfUser && selfUser.avatarId ? `url(${'/static/' + selfUser.avatarId.toLocaleLowerCase() + '.png'})` : null;
    // const avatarBgImage = getPseudoRandomAvatarIdByUserId(user ? user.id : selfUser.id) ? 
    // `url(${'/static/'+getPseudoRandomAvatarIdByUserId(user ? user.id : selfUser.id).toLocaleLowerCase()+'.png'})` : null;
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
            // style={{ backgroundImage: user?.avatarUrl?.length > 0 ? `url(${user.avatarUrl}` : `url(/placeholders/default-silhouette.svg)`} }
        >

            <div className={styles['video-wrapper']}
                 style={{backgroundImage: user?.avatarUrl?.length > 0 ? `url(${user.avatarUrl}` : avatarBgImage ? avatarBgImage : `url(/placeholders/default-silhouette.svg)`}}
                 onClick={() => setFocused(!focused) }
            >
                <video key={peerId + '_cam'} ref={videoRef}/>
            </div>
            <audio key={peerId + '_audio'} ref={audioRef}/>
            <div className={styles['user-controls']}>
                <div className={styles['username']}>{truncateUsername()}</div>
                <div className={styles['controls']}>
                    <div className={styles['mute-controls']}>
                        <Tooltip
                            title={videoProducerPaused === false && videoStreamPaused === false ? 'Pause Video' : 'Resume Video'}>
                            <IconButton
                                color="secondary"
                                size="small"
                                className={styles['video-control']}
                                onClick={(e) => toggleVideo(e)}
                                style={{visibility: (videoStream == null || videoProducerPaused === true || videoProducerGlobalMute) ? 'hidden' : 'visible'}}
                            >
                                {(videoStream && videoProducerPaused === false && videoStreamPaused === false) &&
                                <Videocam/>
                                }
                                {(videoStream && videoProducerPaused === false && videoStreamPaused === true) &&
                                <VideocamOff/>
                                }
                            </IconButton>
                        </Tooltip>
                        <div className={styles['right-controls']}>
                            {
                                enableGlobalMute && peerId !== 'me_cam' && peerId !== 'me_screen' && <Tooltip
                                    title={audioProducerGlobalMute === false ? 'Mute for everyone' : 'Unmute for everyone'}>
                                    <IconButton
                                        color="secondary"
                                        size="small"
                                        className={styles['audio-control']}
                                        onClick={(e) => toggleGlobalMute(e)}
                                    >
                                        {audioStream && audioProducerGlobalMute === false && <RecordVoiceOver/>}
                                        {audioStream && audioProducerGlobalMute === true && <VoiceOverOff/>}
                                    </IconButton>
                                </Tooltip>
                            }
                            {
                                enableGlobalMute && peerId !== 'me_cam' && peerId !== 'me_screen' &&
                                <div className={styles['spacer']}/>
                            }
                            <Tooltip
                                title={(peerId === 'me_cam' || peerId === 'me_screen') && audioStream?.paused === false ? 'Mute me' : (peerId === 'me_cam' || peerId === 'me_screen') && audioStream?.paused === true ? 'Unmute me' : (peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream?.paused === false ? 'Mute this person' : 'Unmute this person'}>
                                <IconButton
                                    color="secondary"
                                    size="small"
                                    className={styles['audio-control']}
                                    onClick={(e) => toggleAudio(e)}
                                    style={{visibility: (audioStream == null || audioProducerPaused === true || audioProducerGlobalMute === true) ? 'hidden' : 'visible'}}
                                >
                                    {((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStreamPaused === false) &&
                                    <Mic/>}
                                    {((peerId === 'me_cam' || peerId === 'me_screen') && audioStream && audioProducerPaused === false && audioStreamPaused === true) &&
                                    <MicOff/>}
                                    {((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === false) &&
                                    <VolumeUp/>}
                                    {((peerId !== 'me_cam' && peerId !== 'me_screen') && audioStream && audioProducerPaused === false && audioStream.paused === true) &&
                                    <VolumeOff/>}
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                    {
                        audioProducerGlobalMute === true && <div className={styles['global-mute']}>Muted by Admin</div>
                    }
                    {
                        audioStream && audioProducerPaused === false && audioProducerGlobalMute === false &&
                        (selfUser?.user_setting?.spatialAudioEnabled === false || selfUser?.user_setting?.spatialAudioEnabled === 0) &&
                        <div className={styles['audio-slider']}>
                            {volume > 0 && <VolumeDown/>}
                            {volume === 0 && <VolumeMute/>}
                            <Slider value={volume} onChange={adjustVolume} aria-labelledby="continuous-slider"/>
                            <VolumeUp/>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
});

export default connect(mapStateToProps, mapDispatchToProps)(PartyParticipantWindow);
