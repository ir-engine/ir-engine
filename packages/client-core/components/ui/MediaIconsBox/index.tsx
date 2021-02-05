import React, { useState } from "react";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff    
} from '@material-ui/icons';
import FaceIcon from '@material-ui/icons/Face';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { observer } from 'mobx-react';
// @ts-ignore
import styles from './MediaIconsBox.module.scss';
import store from "../../../redux/store";
import { MediaStreamSystem } from "@xr3ngine/engine/src/networking/systems/MediaStreamSystem";
import {
    configureMediaTransports,
    createCamAudioProducer,
    createCamVideoProducer,
    endVideoChat,
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

const mapStateToProps = (state: any): any => {
    return {
        onBoardingStep: selectAppOnBoardingStep(state),
        authState: selectAuthState(state),
        locationState: selectLocationState(state)
    };
};

const MediaIconsBox = observer((props) =>{
    const { authState, locationState } = props;

    const [faceTracking, setFaceTracking] = useState(MediaStreamSystem.instance?.faceTracking);

    const user = authState.get('user');
    const currentLocation = locationState.get('currentLocation').get('location');

    const videoEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.videoEnabled : false;
    const instanceMediaChatEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.instanceMediaChatEnabled : false;

    const checkMediaStream = async (partyId: string) => {
        if (!MediaStreamSystem.instance.mediaStream)
            await configureMediaTransports(partyId);
    };

    const handleFaceClick = async () =>{
        const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId;
        await checkMediaStream(partyId);
        setFaceTracking(MediaStreamSystem.instance.setFaceTracking(!MediaStreamSystem.instance?.faceTracking));

        const entity = Network.instance.localClientEntity;
        // if face tracking is false, start face and lip sync tracking
        if(!faceTracking){
            // get local input receiver entity
            startFaceTracking(entity);
            startLipsyncTracking(entity);
        } else {
            stopFaceTracking();
            stopLipsyncTracking();
        }
        // If face tracking is true, stop face and lip sync tracking
    };

    const checkEndVideoChat = async () =>{
        if((MediaStreamSystem.instance.audioPaused || MediaStreamSystem.instance?.camAudioProducer == null) && (MediaStreamSystem.instance.videoPaused || MediaStreamSystem.instance?.camVideoProducer == null)) {
            await endVideoChat({});
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
    };

    const audioPaused = MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camAudioProducer == null || MediaStreamSystem.instance?.audioPaused === true;
    const videoPaused = MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camVideoProducer == null || MediaStreamSystem.instance?.videoPaused === true;
    return (
        <section className={styles.drawerBoxContainer}>
            <section className={styles.drawerBox}>
                { instanceMediaChatEnabled && (<div className={styles.iconContainer + ' ' + (audioPaused ? styles.off : styles.on)}>
                    <MicOff id='micOff' className={styles.offIcon} onClick={handleMicClick} />
                    <Mic id='micOn' className={styles.onIcon} onClick={handleMicClick} />
                </div>) }
                { videoEnabled && (<div className={styles.iconContainer + ' ' + (videoPaused ? styles.off : styles.on)}>
                    <VideocamOff id='videoOff' className={styles.offIcon} onClick={handleCamClick} />
                    <Videocam id='videoOn' className={styles.onIcon} onClick={handleCamClick} />
                </div>) }
                {/* { videoEnabled && (<div className={styles.iconContainer + ' ' + (!faceTracking ? styles.off : styles.on)}>
                    <FaceIcon className={styles.offIcon} onClick={handleFaceClick} />
                    <FaceIcon className={styles.onIcon} onClick={handleFaceClick} />
                </div>)} */}
            </section>
        </section>
    );
});

export default connect(mapStateToProps)(MediaIconsBox);
