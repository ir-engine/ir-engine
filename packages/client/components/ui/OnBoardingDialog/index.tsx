import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Router from 'next/router';
import {Dialog, DialogTitle, DialogContent, Button, IconButton, Typography, CardMedia} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { selectDialogState } from '../../../redux/dialog/selector';
import { closeDialog } from '../../../redux/dialog/service';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import store from '../../../redux/store';

import UserSettings from '../Profile/UserSettings';
import { CharacterAvatarData } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';

import { ArrowIosBackOutline } from '@styled-icons/evaicons-outline/ArrowIosBackOutline';
import { ArrowIosForwardOutline } from '@styled-icons/evaicons-outline/ArrowIosForwardOutline';
import styles from './OnBoardingDialog.module.scss';

const mapStateToProps = (state: any): any => {
  return {
    dialog: selectDialogState(state),
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  closeDialog: bindActionCreators(closeDialog, dispatch)
});

interface DialogProps{
  onBoardingStep?:number;
  title?:string;
  avatarsList?: CharacterAvatarData[];
  actorAvatarId?:string;
  onAvatarChange?:any;
}
const OnBoardingDialog = ({onBoardingStep,title,avatarsList, actorAvatarId, onAvatarChange}:DialogProps): any => {

  useEffect(() => {
    Router.events.on('routeChangeStart', () => {
      closeDialog();
    });
  }, []);

  const handleClose = (e: any): void => {
    e.preventDefault();
    closeDialog();
  };

  let prevAvatarId=null;
  let nextAvatarId=null;

  const recalculateAvatarsSteps = (actorAvatarId) =>{
    if(actorAvatarId === undefined) return;
    let currentAvatarIndex = avatarsList.findIndex(value => value.id === actorAvatarId);
    if (currentAvatarIndex === -1) {
      currentAvatarIndex = 0;
    }
    const nextAvatarIndex = (currentAvatarIndex + 1) % avatarsList.length;
    let prevAvatarIndex = (currentAvatarIndex - 1) % avatarsList.length;
    if (prevAvatarIndex < 0) {
      prevAvatarIndex = avatarsList.length - 1;
    }
    prevAvatarId = (avatarsList[nextAvatarIndex].id);
    nextAvatarId = (avatarsList[prevAvatarIndex].id);
  };
 
  recalculateAvatarsSteps(actorAvatarId);
  
  let isOpened = false;
  let dialogText = '';
  let submitButtonText = '';
  let submitButtonAction = null;
  let otherButtonText = '';
  let otherButtonAction = null;
  let children = null;
  let childrenBeforeText = null;
  const isCloseButton = false;
  const defineDialog = () =>{
    switch(onBoardingStep){
      case  generalStateList.SCENE_LOADED : { 
            isOpened=true; dialogText = 'Virtual Conference / Retail Demo'; submitButtonText =  'Join World';
            submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.SELECT_TUTOR));
            break;
          }
      // case generalStateList.DEVICE_SETUP: {
      //       isOpened = true; title = 'Device Setup'; dialogText = 'Please accept the permissions request to user your microphone.'; 
      //       children =  <UserSettings />; submitButtonText = 'Set Up Microphone';
      //       submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.AVATAR_SELECTION));
      //       break;
      //      } 
      // case generalStateList.AVATAR_SELECTION: {
      //       isOpened= true; title = 'Select An Avatar'; submitButtonText = 'Accept';          
      //       children = <section className={styles.selectionButtonsWrapper}>
      //                     <section className={styles.selectionButtons}>
      //                       <ArrowIosBackOutline onClick={(): void => onAvatarChange(prevAvatarId)} />
      //                       <ArrowIosForwardOutline onClick={(): void => onAvatarChange(nextAvatarId)} />
      //                     </section>
      //                   </section>;
      //       submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.AVATAR_SELECTED));
      //       break;
      //     }
      case generalStateList.AVATAR_SELECTED: {
            store.dispatch(setAppOnBoardingStep(generalStateList.SELECT_TUTOR));            
           break;}
      case generalStateList.SELECT_TUTOR: {
            isOpened= true; title = 'Ready Player One!'; dialogText = 'If this is your first time, we suggest starting with the tutorial.'; 
            submitButtonText = 'Enter World'; otherButtonText = 'Start Tutorial';
            submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));
            otherButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_LOOKAROUND));
           break;}  
      case generalStateList.TUTOR_END: {
            isOpened= true; title = 'Tutorial Complete!';
            children = <p>If you need more asssistance, check out <a target="_blank" href="http://arenagaming.io/help">arenagaming.io/help</a></p>;
            submitButtonText = 'Exit'; 
            submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));
           break;}                              
      default : {isOpened = false;dialogText = '';submitButtonText = '';submitButtonAction = null;children = null; break;}
    }
  };

  defineDialog();

  return (
    <Dialog open={isOpened} onClose={handleClose} aria-labelledby="xr-dialog" 
      classes={{
        root: styles.customDialog,
        paper: styles.customDialogInner + ' ' + styles[generalStateList[onBoardingStep].toLowerCase()]+ ' ' + (onBoardingStep === generalStateList.AVATAR_SELECTION ? styles.avatarDialog : ''), 
      }}
      BackdropProps={{ style: { backgroundColor: "transparent" } }} >
      { (title ||isCloseButton) && (<DialogTitle disableTypography className={styles.dialogTitle}>
        { title && (<Typography variant="h6">{title}</Typography>)}
        {isCloseButton && (<IconButton
          aria-label="close"
          className={styles.dialogCloseButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>)}
      </DialogTitle>)
}

      <DialogContent className={styles.dialogContent}>
        {childrenBeforeText}
        {dialogText && ( <section className={styles.innerText}>{dialogText}</section>)}
        {children}
        {submitButtonText && 
          (<Button variant="outlined" color="primary"
              onClick={submitButtonAction}>{submitButtonText}</Button>)}
        {otherButtonText && 
          (<Button variant="outlined" color="secondary"
              onClick={otherButtonAction}>{otherButtonText}</Button>)}
      </DialogContent>
    </Dialog>
  );
};

const OnBoardingDialogWrapper = (props: DialogProps): any => <OnBoardingDialog {...props } />;

export default connect(mapStateToProps, mapDispatchToProps)(OnBoardingDialogWrapper);
