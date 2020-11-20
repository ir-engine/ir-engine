import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

import styles from './LinearProgress.module.scss';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { connect } from 'react-redux';
import { generalStateList } from '../../../redux/app/actions';
import Backdrop from '@material-ui/core/Backdrop';

interface Props {
  label?: string;
  onBoardingStep?: number;
}

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const LinearProgressComponent = (props: Props) => {
  const{ onBoardingStep, label} = props;
  const openLinear = onBoardingStep === generalStateList.START_STATE ? true : false;
  return <Backdrop className={styles.overlay} open={openLinear}>
      <section className={styles.linearProgressContainer}>
          <p className={styles.loadingProgressTile}>Loading...</p>
          <LinearProgress className={styles.linearProgress} />
          {label.length > 0 && (<p className={styles.loadingProgressInfo}>{label} objects remaining</p>)}        
      </section>
    </Backdrop>;
};
export default connect(mapStateToProps)(LinearProgressComponent);