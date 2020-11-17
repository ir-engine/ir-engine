import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import MicNoneIcon from '@material-ui/icons/MicNone';
import VideocamIcon from '@material-ui/icons/Videocam';
// import { Face } from '@styled-icons/boxicons-regular/Face';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { autorun } from 'mobx';
import { observer } from 'mobx-react';

import styles from './MediaIconsBox.module.scss';
import store from "../../../redux/store";
import {MediaStreamComponent} from "@xr3ngine/engine/src/networking/components/MediaStreamComponent";
import {pauseProducer, resumeProducer} from "../../../classes/transports/WebRTCFunctions";


const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const MediaIconsBox = observer((props) =>{
  const handleMicClick = () =>{
    if(props.onBoardingStep === generalStateList.TUTOR_UNMUTE){
      store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_END));
    } else if (MediaStreamComponent?.instance?.camAudioProducer) {
        const audioPaused = MediaStreamComponent?.instance.toggleAudioPaused();
        if (audioPaused) pauseProducer(MediaStreamComponent.instance.camAudioProducer);
        else resumeProducer(MediaStreamComponent.instance.camAudioProducer);
    }
  };
  
  return props.onBoardingStep >= generalStateList.TUTOR_INTERACT ? 
        <Card className={styles.drawerBoxContainer}>
          <CardContent className={styles.drawerBox}>
              { MediaStreamComponent.instance.audioPaused === false && <MicNoneIcon onClick={handleMicClick} /> }
              { MediaStreamComponent.instance.audioPaused === true && <MicNoneIcon onClick={handleMicClick} /> }
            <VideocamIcon   />
            {/* <Face size="3em" /> */}
          </CardContent>
        </Card>
      :null;
});

export default connect(mapStateToProps)(MediaIconsBox);
