import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button} from '@material-ui/core';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import store from '../../../redux/store';
import { joinWorld } from "@xr3ngine/engine/src/networking/functions/joinWorld";
import styles from './LoadedSceneButtons.module.scss';

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
  };
};

interface Props{
  onBoardingStep?:number; 
}
const LoadedSceneButtons = ({onBoardingStep}:Props): any => {
  const [buttonsDisabled, setButtonsDIsabled] = useState(false);
  const joinWorldHandler = async () =>{
    setButtonsDIsabled(true);
    await joinWorld().then(()=>store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE)));
  };

  const startTutorialHandler = async () =>{
    setButtonsDIsabled(true);
    await joinWorld().then(()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_LOOKAROUND)));
  };
  return onBoardingStep === generalStateList.SCENE_LOADED && 
    (<section className={styles.loadedSceneButtonsContainer}>
        <Button disabled={buttonsDisabled} variant="contained" color="primary" onClick={startTutorialHandler}>Start Tutorial</Button>
        <Button disabled={buttonsDisabled} variant="contained" onClick={joinWorldHandler} className="join_world">Join World</Button>
    </section>);
};


export default connect(mapStateToProps)(LoadedSceneButtons);
