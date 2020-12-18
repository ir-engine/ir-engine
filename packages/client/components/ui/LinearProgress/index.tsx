import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

import styles from './LinearProgress.module.scss';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { connect } from 'react-redux';
import { generalStateList } from '../../../redux/app/actions';
import { selectScenesCurrentScene } from '../../../redux/scenes/selector';
import { ImageMediaGridItem } from '../../editor/layout/MediaGrid';

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
  const openLinear = onBoardingStep === generalStateList.START_STATE ? true : false;
  const count = parseInt(label) || null;
  return openLinear === true ? <>
    <section className={styles.overlay}>
      <ImageMediaGridItem className={styles.imageOverlay} src={currentScene?.thumbnailUrl} label={''} />
      <section className={styles.linearProgressContainer}>
          <p className={styles.loadingProgressTile}>Loading...</p>
          <LinearProgress className={styles.linearProgress} />
          {count && count > 0 && (<p className={styles.loadingProgressInfo}>{count} object{count > 1 && 's'} remaining</p>)}        
      </section>
    </section></> : null;
};
export default connect(mapStateToProps)(LinearProgressComponent);