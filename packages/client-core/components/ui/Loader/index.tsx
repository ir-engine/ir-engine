import React, { useEffect, useState } from 'react';
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
    onBoardingStep: selectAppOnBoardingStep(state),
    currentScene: selectScenesCurrentScene(state),
  };
};

const LinearProgressComponent = (props: Props) => {
  const { onBoardingStep, label, currentScene } = props;
  const [showProgressBar, setShowProgressBar] = useState(true);
  useEffect(() => {
    if (onBoardingStep === generalStateList.START_STATE) {
      setShowProgressBar(true);
    } else if(showProgressBar) {
      setTimeout(() => { setShowProgressBar(false) }, 2000);
    }
  }, [onBoardingStep])

  const count = parseInt(label) || null;
  return showProgressBar === true ? <>
    <Loader />
    <section className={styles.overlay} style={{ backgroundImage: `url(${currentScene?.thumbnailUrl})` }}>
      <section className={styles.linearProgressContainer}>
        {!count && (<span className={styles.loadingProgressInfo}>Loading...</span>)}
        {count && count > 0 && (<span className={styles.loadingProgressInfo}>{count} object{count > 1 && 's'} remaining</span>)}
        {count && count === 0 && (<span className={styles.loadingProgressInfo}>Entering world...</span>)}
        {/* <LinearProgress className={styles.linearProgress} />                   */}
        {/* {count && count > 0 && (<p className={styles.loadingProgressInfo}>{count} object{count > 1 && 's'} remaining</p>)}   */}
        {/* <TesseractProjection />        */}
      </section>
    </section></> : null;
};
export default connect(mapStateToProps)(LinearProgressComponent);