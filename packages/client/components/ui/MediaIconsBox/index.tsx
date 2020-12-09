import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import {
    Mic,
    MicOff,
    Videocam,
    VideocamOff
} from '@material-ui/icons';
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


const mapStateToProps = (state: any): any => {
    return {
        onBoardingStep: selectAppOnBoardingStep(state),
        authState: selectAuthState(state),
        locationState: selectLocationState(state)
    };
};

const MediaIconsBox = observer((props) =>{
    const { onBoardingStep, authState, locationState } = props;

    const user = authState.get('user');
    const currentLocation = locationState.get('currentLocation').get('location');

    const checkMediaStream = async (partyId: string) => {
        if (!MediaStreamComponent?.instance?.mediaStream)
            await configureMediaTransports(partyId);
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
        <Card className={styles.drawerBoxContainer}>
            <CardContent className={styles.drawerBox}>
                {audioPaused ? <MicOff onClick={handleMicClick} /> : <Mic onClick={handleMicClick} />}
                {videoPaused ? <VideocamOff onClick={handleCamClick} /> : <Videocam onClick={handleCamClick} />}
            </CardContent>
        </Card>
        :null;
});

export default connect(mapStateToProps)(MediaIconsBox);
