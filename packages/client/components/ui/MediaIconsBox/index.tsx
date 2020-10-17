import React from "react";

import './style.scss';
import { generalStateList } from '../../../redux/app/actions';
import { Microphone } from '@styled-icons/boxicons-regular/Microphone';
import { CameraVideo } from '@styled-icons/bootstrap/CameraVideo';
import { Face } from '@styled-icons/boxicons-regular/Face';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const MediaIconsBox = (props) =>{
  return props.onBoardingStep === generalStateList.ALL_DONE ? 
        <section className="drawer-box-container">
          <section className="drawer-box">
            <Microphone />
            <CameraVideo />
            <Face />
          </section>
        </section>
      :null;
};

export default connect(mapStateToProps)(MediaIconsBox);
