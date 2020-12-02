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
import {MediaStreamComponent} from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import {endVideoChat, pauseProducer, resumeProducer, sendCameraStreams} from "../../../classes/transports/WebRTCFunctions";
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
  const handleMicClick = async () =>{
    if(onBoardingStep === generalStateList.TUTOR_UNMUTE){
      store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_END));
      return;
    } 
    console.log('handleMicClick MediaStreamComponent?.instance=',MediaStreamComponent?.instance )

    // if(!MediaStreamComponent?.instance?.camAudioProducer){MediaStreamComponent.instance.camAudioProducer}
    // if (MediaStreamComponent?.instance?.camAudioProducer) {

    //   const audioPaused = MediaStreamComponent?.instance.toggleAudioPaused();
    //   console.log('handleMicClick audioPaused=',audioPaused, 'MediaStreamComponent?.instance?.audioPaused=', MediaStreamComponent?.instance?.audioPaused )
        
    //     if (audioPaused) await pauseProducer(MediaStreamComponent.instance.camAudioProducer);
    //     else await resumeProducer(MediaStreamComponent.instance.camAudioProducer);
    // }
  };

  const handleCamClick = async () => {
      if (MediaStreamComponent.instance.mediaStream == null) {
        await sendCameraStreams(currentLocation?.locationSettings?.instanceMediaChatEnabled === true ? 'instance' : user.partyId);
        console.log("Send camera streams called from handleCamClick in MediaIconsBox ui component");
      } else {
        await endVideoChat({});
      }
  };

  return props.onBoardingStep >= generalStateList.TUTOR_INTERACT ?
        <Card className={styles.drawerBoxContainer}>
          <CardContent className={styles.drawerBox}>
              { MediaStreamComponent?.instance?.audioPaused !== true && <Mic onClick={handleMicClick} /> }
              { MediaStreamComponent?.instance?.audioPaused === true && <MicOff onClick={handleMicClick} /> }
              { MediaStreamComponent?.instance?.mediaStream !== null && <Videocam onClick={handleCamClick} /> }
              { MediaStreamComponent?.instance?.mediaStream == null && <VideocamOff onClick={handleCamClick} />}
            {/* <Face size="3em" /> */}
          </CardContent>
        </Card>
      :null;
});

export default connect(mapStateToProps)(MediaIconsBox);
