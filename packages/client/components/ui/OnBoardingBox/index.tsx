import React from "react";

import styles from './OnBoardingBox.module.scss';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Button, Snackbar, SnackbarContent } from '@material-ui/core';
import {ArrowheadLeftOutline} from '@styled-icons/evaicons-outline/ArrowheadLeftOutline';
import {ArrowheadRightOutline} from '@styled-icons/evaicons-outline/ArrowheadRightOutline';
import {DotCircle} from '@styled-icons/fa-regular/DotCircle';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import store from "../../../redux/store";


const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};


const OnBoardingBox = (props) =>{
  const { onBoardingStep }  = props;
  const renderHintIcons = () =>{
    switch(onBoardingStep){
      case generalStateList.TUTOR_LOOKAROUND: 
          return <section className={styles.lookaround}><ArrowheadLeftOutline /><ArrowheadRightOutline /></section>; 
      case generalStateList.TUTOR_MOVE:
          return isMobileOrTablet() ? <section className={styles.movearound}><DotCircle /></section> : '';
      default : return '';
    }
  };
  let message = '';
  let action = null;
  switch(onBoardingStep){
    case generalStateList.TUTOR_LOOKAROUND:message=' Drag anywhere to look around'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_MOVE)); break;      
    case generalStateList.TUTOR_MOVE: message= isMobileOrTablet() ? ' Use joystick to move' : 'Use mouse to move'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_UNMUTE)); break;
    case generalStateList.TUTOR_UNMUTE: message='Tap to unmute'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_VIDEO)); break;
    case generalStateList.TUTOR_VIDEO: message='Tap to enable stream'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));  break;
    default : message= '';break;
  }     
  const additionalStyle = onBoardingStep === generalStateList.TUTOR_MOVE && isMobileOrTablet() ? styles.rightContentWidth : '';
  return message ? 
                <>
                  {renderHintIcons()}
                  <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
                  className={styles.helpHintSnackBar + additionalStyle} open={true} 
                  autoHideDuration={10000}>
                      <SnackbarContent className={styles.helpHintSnackBarContent} message={message} 
                      action={<Button onClick={action} color="primary">(Skip)</Button>} />                      
                  </Snackbar>
                </>
              :null;
};

export default connect(mapStateToProps)(OnBoardingBox);
