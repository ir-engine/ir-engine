import React, { useEffect } from 'react';
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

import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter';
import UserSettings from '../Profile/UserSettings';

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

const OnBoardingDialog = (props) => {
  const { onBoardingStep, title = ''} = props;

  useEffect(() => {
    Router.events.on('routeChangeStart', () => {
      closeDialog();
    });
  }, []);

  const handleClose = (e: any): void => {
    e.preventDefault();
    closeDialog();
  };

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
            submitButtonAction = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.AVATAR_SELECTED));
            break;
          }  
      case generalStateList.AVATAR_SELECTED: {
            //createPrefab(PlayerCharacter);
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
    <Dialog open={isOpened} onClose={handleClose} aria-labelledby="xr-dialog" className={styles.customDialog}>
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

const OnBoardingDialogWrapper = (props: any): any => <OnBoardingDialog {...props } />;

export default connect(mapStateToProps, mapDispatchToProps)(OnBoardingDialogWrapper);
