import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Router from 'next/router';
import {Dialog, DialogTitle, DialogContent, Button, IconButton, Typography} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { selectDialogState } from '../../../redux/dialog/selector';
import { closeDialog } from '../../../redux/dialog/service';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import store from '../../../redux/store';

import UserSettings from '../Profile/UserSettings';
import { CharacterAvatarData } from '@xr3ngine/engine/src/templates/character/CharacterAvatars'

import { ArrowIosBackOutline } from '@styled-icons/evaicons-outline/ArrowIosBackOutline'
import { ArrowIosForwardOutline } from '@styled-icons/evaicons-outline/ArrowIosForwardOutline'
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
  }
 
  recalculateAvatarsSteps(actorAvatarId);
  
  let isOpened = false;
  let dialogText = '';
  let submitButtonText = '';
  let submitButtonAction = null;
  let children = null;
  const isCloseButton = false;
  const defineDialog = () =>{
    switch(onBoardingStep){
      case  generalStateList.SCENE_LOADED : { 
            isOpened=true; dialogText = 'Virtual retail experience'; submitButtonText =  'Enter The World';
            submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.AVATAR_SELECTION));
            break;
          }
      case generalStateList.AVATAR_SELECTION: {
            isOpened= true; dialogText = 'Select Your Avatar'; submitButtonText = 'Accept';          
            children = <section className={styles.selectionButtons}>
                          <ArrowIosBackOutline onClick={(): void => onAvatarChange(prevAvatarId)} />
                          <ArrowIosForwardOutline onClick={(): void => onAvatarChange(nextAvatarId)} />
                        </section>;
            submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.AVATAR_SELECTED));
            break;
          }  
      case generalStateList.AVATAR_SELECTED: {
            store.dispatch(setAppOnBoardingStep(generalStateList.DEVICE_SETUP));            
           break;}
      case generalStateList.DEVICE_SETUP: {
          isOpened = true; dialogText = 'Device Setup'; children =  <UserSettings />; submitButtonText = 'Accept';
          submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_LOOKAROUND));
          break;
         }     
      default : {isOpened = false;dialogText = '';submitButtonText = '';submitButtonAction = null;children = null; break;}
    }
  };

  defineDialog();

  return (
    <Dialog open={isOpened} onClose={handleClose} aria-labelledby="xr-dialog" 
      classes={{
        paper: styles.avatarDialog,
      }}
      BackdropProps={{ style: { backgroundColor: "transparent" } }}
      className={styles.customDialog}>
      <DialogTitle disableTypography className={styles.dialogTitle}>
        { title && (<Typography variant="h6">{title}</Typography>)}
        {isCloseButton && (<IconButton
          aria-label="close"
          className={styles.dialogCloseButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>)}
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {dialogText && ( <section className={styles.innerText}>{dialogText}</section>)}
        {children}
        {submitButtonText && 
          (<Button variant="contained" color="primary" 
              onClick={submitButtonAction}>{submitButtonText}</Button>)}
      </DialogContent>
    </Dialog>
  );
};

const OnBoardingDialogWrapper = (props: DialogProps): any => <OnBoardingDialog {...props } />;

export default connect(mapStateToProps, mapDispatchToProps)(OnBoardingDialogWrapper);
