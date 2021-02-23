import React, { useState } from "react";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff,
} from '@material-ui/icons';
import FaceIcon from '@material-ui/icons/Face';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
// @ts-ignore
import styles from './MediaIconsBox.module.scss';
import store from "../../../redux/store";
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import {
    configureMediaTransports,
    createCamAudioProducer,
    createCamVideoProducer,
    endVideoChat, leave,
    pauseProducer,
    resumeProducer
} from "@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions";
import { selectAuthState } from "../../../redux/auth/selector";
import { selectLocationState } from "../../../redux/location/selector";

import {
    startFaceTracking,
    startLipsyncTracking,
    stopFaceTracking,
    stopLipsyncTracking
} from "@xr3ngine/engine/src/input/behaviors/WebcamInputBehaviors";
import { Network } from "@xr3ngine/engine/src/networking/classes/Network";
import { VrIcon } from "../Icons/Vricon";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { startVR } from "@xr3ngine/engine/src/input/functions/WebXRFunctions";

const mapStateToProps = (state: any): any => {
    return {
        onBoardingStep: selectAppOnBoardingStep(state),
        authState: selectAuthState(state),
        locationState: selectLocationState(state)
    };
};

const MediaIconsBox = (props) => {
    const { authState, locationState } = props;

    const [faceTracking, setFaceTracking] = useState(MediaStreamSystem.instance?.faceTracking);
    const [xrSupported, setXRSupported] = useState(Engine.renderer?.xr.supported);
    const [videoPaused, setVideoPaused] = useState(MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camVideoProducer == null || MediaStreamSystem.instance?.videoPaused === true);
    const [audioPaused, setAudioPaused] = useState(MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camAudioProducer == null || MediaStreamSystem.instance?.audioPaused === true);


    const user = authState.get('user');
    const currentLocation = locationState.get('currentLocation').get('location');

    const videoEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.videoEnabled : false;
    const instanceMediaChatEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.instanceMediaChatEnabled : false;

    (navigator as any).xr?.isSessionSupported('immersive-vr').then(supported => {
      setXRSupported(supported);
    })

    const checkMediaStream = async (partyId: string) => {
        if (!MediaStreamSystem.instance.mediaStream)
            await configureMediaTransports(partyId);
    };

    const handleFaceClick = async () => {
        const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId;
        await checkMediaStream(partyId);
        setFaceTracking(MediaStreamSystem.instance.setFaceTracking(!MediaStreamSystem.instance?.faceTracking));

        const entity = Network.instance.localClientEntity;
        // if face tracking is false, start face and lip sync tracking
        if (!faceTracking) {
            // get local input receiver entity
            startFaceTracking(entity);
            startLipsyncTracking(entity);
        } else {
            stopFaceTracking();
            stopLipsyncTracking();
        }
        // If face tracking is true, stop face and lip sync tracking
    };

    const checkEndVideoChat = async () => {
        if ((MediaStreamSystem.instance.audioPaused || MediaStreamSystem.instance?.camAudioProducer == null) && (MediaStreamSystem.instance.videoPaused || MediaStreamSystem.instance?.camVideoProducer == null)) {
            await endVideoChat({});
            if ((Network.instance.transport as any).channelSocket?.connected === true) await leave(false);
        }
    };
    const handleMicClick = async () => {
        const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId;
        await checkMediaStream(partyId);

        if (MediaStreamSystem.instance?.camAudioProducer == null) await createCamAudioProducer(partyId);
        else {
            const audioPaused = MediaStreamSystem.instance.toggleAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamSystem.instance?.camAudioProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camAudioProducer);
            checkEndVideoChat();
        }

        setAudioPaused(MediaStreamSystem.instance?.audioPaused);
    };

    const handleCamClick = async () => {
        const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId;
        await checkMediaStream(partyId);
        if (MediaStreamSystem.instance?.camVideoProducer == null) await createCamVideoProducer(partyId);
        else {
            const videoPaused = MediaStreamSystem.instance.toggleVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamSystem.instance?.camVideoProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camVideoProducer);
            checkEndVideoChat();
        }

        setVideoPaused(MediaStreamSystem.instance?.videoPaused);
    };

    const handleVRClick = () => {
        startVR();
    };

    const xrEnabled = Engine.renderer?.xr.enabled === true;
    const VideocamIcon = videoPaused ? VideocamOff : Videocam;
    const MicIcon = audioPaused ? MicOff : Mic;
    return (
        <section className={styles.drawerBox}>
            {instanceMediaChatEnabled
                ? <button type="button" className={styles.iconContainer + ' ' + (audioPaused ? '' : styles.on)} onClick={handleMicClick}>
                    <MicIcon />
                </button> : null}
            {videoEnabled
                ? <>
                    <button type="button" className={styles.iconContainer + ' ' + (videoPaused ? '' : styles.on)} onClick={handleCamClick}>
                        <VideocamIcon />
                    </button>
                    <button type="button" className={styles.iconContainer + ' ' + (!faceTracking ? '' : styles.on)} onClick={handleFaceClick}>
                        <FaceIcon />
                    </button>
                </> : null}
            {xrSupported
                ? <button type="button" className={styles.iconContainer + ' ' + (!xrEnabled ? '' : styles.on)} onClick={handleVRClick}>
                    <VrIcon /> 
                </button> : null}
        </section>
    );
};

export default connect(mapStateToProps)(MediaIconsBox);
