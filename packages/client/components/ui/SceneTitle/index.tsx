import React from 'react';
import { connect } from 'react-redux';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { generalStateList } from '../../../redux/app/actions';
import styles from './SceneTitle.module.scss';
import Snackbar from '@material-ui/core/Snackbar';
import { selectScenesCurrentScene } from '../../../redux/scenes/selector';
import { Typography } from '@material-ui/core';

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    currentScene: selectScenesCurrentScene(state)
  };
};

interface Props{
  onBoardingStep?: number; 
  currentScene?: any;
}
const SceneTitle = ({onBoardingStep, currentScene}:Props): any => {
  const invitationLink = window.location.href;

  return (onBoardingStep === 0 || onBoardingStep === generalStateList.SCENE_LOADED || onBoardingStep === generalStateList.SCENE_LOADING) && 
    (<Snackbar 
      anchorOrigin={{vertical: 'top',horizontal: 'center'}} 
      classes={{root:styles.parentContainer}}
      open={true} 
      autoHideDuration={10000}>
        <>
          <Typography variant="h1" color="primary" align="center">{currentScene?.name}</Typography>
          <Typography variant="h6" color="primary" align="center">{invitationLink}</Typography>
        </>
      </Snackbar>)   
};


export default connect(mapStateToProps)(SceneTitle);
