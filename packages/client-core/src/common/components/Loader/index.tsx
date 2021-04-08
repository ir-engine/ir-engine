import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { generalStateList } from '../../reducers/app/actions';
import { selectAppOnBoardingStep } from '../../reducers/app/selector';
import { selectCurrentScene } from '../../../world/reducers/scenes/selector';
import Loader from './SquareLoader';
import * as styles from './style.module.scss';
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
          setTimeout(() => { setShowProgressBar(false); }, 1500);
    }
  }, [onBoardingStep, objectsToLoad]);

  if (!showProgressBar) return null;

  let loadingText = 'Entering world...';
  if (!showEntering) {
    if (objectsToLoad >= 99) loadingText = 'Loading...';
    else if (objectsToLoad > 0) loadingText = objectsToLoad + ' object' + (objectsToLoad > 1 ? 's ' : ' ') + 'remaining';
  }

  return <>
    <Loader />
    <section className={styles.overlay} style={{ backgroundImage: `url(${currentScene?.thumbnailUrl})` }}>
      <section className={styles.linearProgressContainer}>
        <span className={styles.loadingProgressInfo}>{loadingText}</span>
      </section>
    </section></>;
};
export default connect(mapStateToProps)(LoadingScreen);