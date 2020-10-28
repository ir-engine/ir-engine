import React from "react";

import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Button, Snackbar, SnackbarContent } from '@material-ui/core';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import store from "../../../redux/store";

import styles from './OnBoardingBox.module.scss';

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};


const OnBoardingBox = (props) =>{
  const { onBoardingStep }  = props;

  let message = '';
  let action = null;
  switch(onBoardingStep){
    case generalStateList.TUTOR_LOOKAROUND:message='Touch and Drag to look around'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_MOVE)); break;      
    case generalStateList.TUTOR_MOVE: message= isMobileOrTablet() ? ' Use joystick to move' : 'Use mouse to move'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_INTERACT)); break;
    case generalStateList.TUTOR_INTERACT: message= isMobileOrTablet() ? 'Use to interact' : 'Press E to interact'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_UNMUTE)); break;
    case generalStateList.TUTOR_UNMUTE: message='Tap to toggle Mic'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_END)); break;
    // case generalStateList.TUTOR_VIDEO: message='Tap to enable stream'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));  break;
    default : message= '';break;
  }     
  return message ? 
                <>
                  <section className={styles.exitButtonContainer}>
                    <Button variant="outlined" color="primary" className={styles.exitButton} 
                        onClick={()=>store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE))}>Exit Tutorial</Button>
                  </section>
                  <Snackbar 
                  anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
                  classes={{
                    root: styles.helpHintSnackBar +' '+ styles[generalStateList[onBoardingStep].toLowerCase()]+ ' ' + styles[`isMobile${isMobileOrTablet()}`],
                    anchorOriginBottomCenter: styles.bottomPos,                    
                  }}
                  open={true} 
                  autoHideDuration={10000}>
                      <SnackbarContent className={styles.helpHintSnackBarContent} message={message} 
                      action={<Button onClick={action} color="primary">(Skip)</Button>} />                      
                  </Snackbar>
                </>
              :null;
};

export default connect(mapStateToProps)(OnBoardingBox);
