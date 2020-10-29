import React from "react";

import { generalStateList } from '../../../redux/app/actions';
import { Microphone } from '@styled-icons/boxicons-regular/Microphone';
// import { CameraVideo } from '@styled-icons/bootstrap/CameraVideo';
// import { Face } from '@styled-icons/boxicons-regular/Face';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";

import styles from './MediaIconsBox.module.scss';

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const MediaIconsBox = (props) =>{
  return props.onBoardingStep >= generalStateList.TUTOR_UNMUTE ? 
        <section className={styles.drawerBoxContainer}>
          <section className={styles.drawerBox}>
            <Microphone />
            {/* <CameraVideo size="3em"  /> */}
            {/* <Face size="3em" /> */}
          </section>
        </section>
      :null;
};

export default connect(mapStateToProps)(MediaIconsBox);
