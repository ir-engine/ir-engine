import React from 'react';
import styles from './style.module.scss';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { connect } from 'react-redux';
import { generalStateList } from '../../../redux/app/actions';
import { selectScenesCurrentScene } from '../../../redux/scenes/selector';
import Loader from './OrbitLoader';
import LinearProgress from '@material-ui/core/LinearProgress';
interface Props {
  label?: string;
  onBoardingStep?: number;
  currentScene?: any;
}

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep : selectAppOnBoardingStep(state),
    currentScene : selectScenesCurrentScene(state),
  };
};

const LinearProgressComponent = (props: Props) => {
  const{ onBoardingStep, label, currentScene} = props;
  let showProgressBar = null;
  if(onBoardingStep === generalStateList.START_STATE){
    showProgressBar = true;
  }else{
    const hideLinearProgress = setTimeout(() => {showProgressBar = false; clearTimeout(hideLinearProgress);}, 1000);
  }
  const count = parseInt(label) || null;
  return showProgressBar === true ? <>
  <Loader />
    <section className={styles.overlay} style={{backgroundImage: `url(${currentScene?.thumbnailUrl})`}}>
      <section className={styles.linearProgressContainer}>
          <p className={styles.loadingProgressTile}>
            <span>Loading...</span>
            {/* {count && count > 0 && (<span className={styles.loadingProgressInfo}>{count} object{count > 1 && 's'} remaining</span>)} */}
          </p>
          <LinearProgress className={styles.linearProgress} />                  
          {count && count > 0 && (<p className={styles.loadingProgressInfo}>{count} object{count > 1 && 's'} remaining</p>)}  
          {/* <TesseractProjection />        */}
      </section>
    </section></> : null;
};
export default connect(mapStateToProps)(LinearProgressComponent);