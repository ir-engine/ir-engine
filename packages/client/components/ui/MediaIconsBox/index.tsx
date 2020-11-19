import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import MicNoneIcon from '@material-ui/icons/MicNone';
import VideocamIcon from '@material-ui/icons/Videocam';
// import { Face } from '@styled-icons/boxicons-regular/Face';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";

import styles from './MediaIconsBox.module.scss';
import store from "../../../redux/store";


const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const MediaIconsBox = (props) =>{
  const handleMicClick = () =>{
    if(props.onBoardingStep === generalStateList.TUTOR_UNMUTE){
      store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_END));
    }
  };
  
  return props.onBoardingStep >= generalStateList.TUTOR_INTERACT ? 
        <Card className={styles.drawerBoxContainer}>
          <CardContent className={styles.drawerBox}>
            <MicNoneIcon onClick={handleMicClick} />
            <VideocamIcon   />
            {/* <Face size="3em" /> */}
          </CardContent>
        </Card>
      :null;
};

export default connect(mapStateToProps)(MediaIconsBox);
