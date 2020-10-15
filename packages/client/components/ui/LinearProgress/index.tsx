import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

import './style.module.css';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { connect } from 'react-redux';
import { generalStateList } from '../../../redux/app/actions';

interface Props {
  label?: string;
  onBoardingStep?:number;
}

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const LinearProgressComponent = (props: Props) => {
  const{ onBoardingStep, label} = props;
  return  onBoardingStep === generalStateList.START_STATE ?
    <div className="overlay">
      <section className="linearProgressContainer">
          {label.length > 0 && (<span className="loadingProgressTile">{label}</span>)}        
          <LinearProgress className="linearProgress" />
      </section>
    </div>
  : null;
};
export default connect(mapStateToProps)(LinearProgressComponent);