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

import styles from './MediaIconsBox.module.scss';
import store from "../../../redux/store";
import { MediaStreamComponent } from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import {
    configureMediaTransports,
    createCamAudioProducer,
    createCamVideoProducer,
    endVideoChat,
    pauseProducer,
    resumeProducer
} from "../../../classes/transports/WebRTCFunctions";
import { selectAuthState } from "../../../redux/auth/selector";
import { selectLocationState } from "../../../redux/location/selector";

import {
    startFaceTracking,
    startLipsyncTracking,
    stopFaceTracking,
    stopLipsyncTracking
} from "@xr3ngine/engine/src/input/behaviors/WebcamInputBehaviors";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";

const mapStateToProps = (state: any): any => {
    return {
        onBoardingStep: selectAppOnBoardingStep(state),
        authState: selectAuthState(state),
        locationState: selectLocationState(state)
    };
};

const MediaIconsBox = observer((props) =>{
    const { onBoardingStep, authState, locationState } = props;

    const [faceTracking, setFaceTracking] = useState(MediaStreamComponent?.instance?.faceTracking);

    const user = authState.get('user');
    const currentLocation = locationState.get('currentLocation').get('location');

    const videoEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.videoEnabled : false;
    const instanceMediaChatEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.instanceMediaChatEnabled : false;

    const checkMediaStream = async (partyId: string) => {
        if (!MediaStreamComponent?.instance?.mediaStream)
            await configureMediaTransports(partyId);
    };

    const handleFaceClick = async () =>{
        const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId;
        await checkMediaStream(partyId);
        setFaceTracking(MediaStreamComponent.instance.setFaceTracking(!MediaStreamComponent?.instance?.faceTracking));

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
        if((MediaStreamComponent?.instance?.audioPaused || MediaStreamComponent?.instance?.camAudioProducer == null) && (MediaStreamComponent?.instance?.videoPaused || MediaStreamComponent?.instance?.camVideoProducer == null)) {
            await endVideoChat({});
        }
    };
    const handleMicClick = async () => {
        if(onBoardingStep === generalStateList.TUTOR_UNMUTE){
            store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_END));
            return;
        }
        const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId;
        await checkMediaStream(partyId);

        if (MediaStreamComponent.instance.camAudioProducer == null) await createCamAudioProducer(partyId);
        else {
            const audioPaused = MediaStreamComponent.instance.toggleAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamComponent.instance.camAudioProducer);
            else await resumeProducer(MediaStreamComponent.instance.camAudioProducer);
            checkEndVideoChat();
        }
    };

    const handleCamClick = async () => {
        const partyId = currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId;
        await checkMediaStream(partyId);
        if (MediaStreamComponent.instance.camVideoProducer == null) await createCamVideoProducer(partyId);
        else {
            const videoPaused = MediaStreamComponent.instance.toggleVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamComponent.instance.camVideoProducer);
            else await resumeProducer(MediaStreamComponent.instance.camVideoProducer);
            checkEndVideoChat();
        }
    };

    const audioPaused = MediaStreamComponent?.instance?.mediaStream === null || MediaStreamComponent?.instance?.camAudioProducer == null || MediaStreamComponent?.instance?.audioPaused === true;
    const videoPaused = MediaStreamComponent?.instance?.mediaStream === null || MediaStreamComponent?.instance?.camVideoProducer == null || MediaStreamComponent?.instance?.videoPaused === true;
    return props.onBoardingStep >= generalStateList.TUTOR_INTERACT ?
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
        :null;
});

export default connect(mapStateToProps)(MediaIconsBox);
