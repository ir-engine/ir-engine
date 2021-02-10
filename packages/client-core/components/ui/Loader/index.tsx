import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { generalStateList } from '../../../redux/app/actions';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectCurrentScene } from '../../../redux/scenes/selector';
import Loader from './SquareLoader';
import styles from './style.module.scss';
interface Props {
  objectsToLoad?: number;
  onBoardingStep?: number;
  currentScene?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    currentScene: selectCurrentScene(state),
  };
};

const LoadingScreen = (props: Props) => {
  const { onBoardingStep, objectsToLoad, currentScene } = props;
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showEntering, setShowEntering] = useState(false);

  useEffect(() => {

    if (onBoardingStep === generalStateList.START_STATE) {
      setShowProgressBar(true);
    } else if (showProgressBar && !showEntering) {
      setShowEntering(true);
          setTimeout(() => { setShowProgressBar(false) }, 1500);
    }
  }, [onBoardingStep, objectsToLoad])

  return showProgressBar === true ? <>
    <Loader />
    <section className={styles.overlay} style={{ backgroundImage: `url(${currentScene?.thumbnailUrl})` }}>
      <section className={styles.linearProgressContainer}>
        {!showEntering && (objectsToLoad >= 99 || !objectsToLoad) && (<span className={styles.loadingProgressInfo}>Loading...</span>)}
        {!showEntering && objectsToLoad > 0 && (<span className={styles.loadingProgressInfo}>{objectsToLoad} object{objectsToLoad > 1 && 's'} remaining</span>)}
        {showEntering && (<span className={styles.loadingProgressInfo}>Entering world...</span>)}
      </section>
    </section></> : null;
};
export default connect(mapStateToProps)(LoadingScreen);