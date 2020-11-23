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
    const { onBoardingStep } = props;
  const handleMicClick = async () =>{
    if(onBoardingStep === generalStateList.TUTOR_UNMUTE){
      store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_END));
    } else if (MediaStreamComponent?.instance?.camAudioProducer) {
        const audioPaused = MediaStreamComponent?.instance.toggleAudioPaused();
        if (audioPaused) await pauseProducer(MediaStreamComponent.instance.camAudioProducer);
        else await resumeProducer(MediaStreamComponent.instance.camAudioProducer);
    }
  };

  const handleCamClick = async () => {
      if (MediaStreamComponent?.instance?.camVideoProducer) {
          const videoPaused = MediaStreamComponent?.instance.toggleVideoPaused();
          if (videoPaused) await pauseProducer(MediaStreamComponent.instance.camVideoProducer);
          else await resumeProducer(MediaStreamComponent.instance.camVideoProducer);
      }
  };

  return props.onBoardingStep >= generalStateList.TUTOR_INTERACT ?
        <Card className={styles.drawerBoxContainer}>
          <CardContent className={styles.drawerBox}>
              { MediaStreamComponent.instance.audioPaused !== true && <Mic onClick={handleMicClick} /> }
              { MediaStreamComponent.instance.audioPaused === true && <MicOff onClick={handleMicClick} /> }
              { MediaStreamComponent.instance.videoPaused !== true && <Videocam onClick={handleCamClick} /> }
              { MediaStreamComponent.instance.videoPaused === true && <VideocamOff onClick={handleCamClick} />}
            {/* <Face size="3em" /> */}
          </CardContent>
        </Card>
      :null;
});

export default connect(mapStateToProps)(MediaIconsBox);
