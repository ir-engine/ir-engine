// import React, { CSSProperties, FunctionComponent } from "react";
// import './style.module.css';

// export type HintBoxProps = {
//   layout: string;
// };

// export const HintBox: FunctionComponent<HintBoxProps> = ({ layout }: HintBoxProps) => {
//   const keysHintsList = {
//     default: [{keys:['w','s','a','d'], title:'Move'},{keys:['space'], title:'Jump'}],
//     car: [{keys:['w','s','a','d'], title:'Move'},{keys:['e'], title:'get out of the car'}]
//   };

//   document.getElementById('control-hint-box') ?  document.getElementById('control-hint-box').style.opacity = '1' : null;
  
//   return <div id="control-hint-box" className='controlsHintBox'>
//             <h3>Controls</h3>
//             {keysHintsList[layout].map(line=> 
//               (<section key={line.title}>
//                 {line.keys.map(key=><span key={key} className='keyButton'>{key}</span>)}
//                 to {line.title}</section>))}    
//           </div>;
// };
import React from "react";

import './style.module.css';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
// import { generalStateList } from '../../../redux/app/actions';
import { Button, Snackbar } from '@material-ui/core';
import {ArrowheadLeftOutline} from '@styled-icons/evaicons-outline/ArrowheadLeftOutline';
import {ArrowheadRightOutline} from '@styled-icons/evaicons-outline/ArrowheadRightOutline';
import {DotCircle} from '@styled-icons/fa-regular/DotCircle';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions'
import store from "../../../redux/store";


const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};


const OnBoardingBox = (props) =>{
  const { onBoardingStep }  = props;
  const renderHintIcons = () =>{
    switch(onBoardingStep){
      case generalStateList.TUTOR_LOOKAROUND: 
          return <section className="lookaround"><ArrowheadLeftOutline /><ArrowheadRightOutline /></section>; 
      case generalStateList.TUTOR_MOVE:
          return isMobileOrTablet() ? <section className="movearound"><DotCircle /></section> : '';
      default : return '';
    }
  }
  let message = '';
  let action = null;
  switch(onBoardingStep){
    case generalStateList.TUTOR_LOOKAROUND:message=' Drag anywhere to look around'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_MOVE)); break;      
    case generalStateList.TUTOR_MOVE: message= isMobileOrTablet() ? ' Use joystick to move' : 'Use mouse to move'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_UNMUTE)); break;
    case generalStateList.TUTOR_UNMUTE: message='Tap to unmute'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_VIDEO)); break;
    case generalStateList.TUTOR_VIDEO: message='Tap to enable stream'; action = ()=>store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));  break;
    default : message= '';break;
  }     
      
  return message ? 
                <>
                  {renderHintIcons()}
                  <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
                  className={`helpHintSnackBar ${onBoardingStep === generalStateList.TUTOR_MOVE ? 'right-content-width' : ''}`} open={true} 
                  autoHideDuration={10000} message={message} 
                  action={<Button onClick={action} color="primary">(Skip)</Button>} />
                </>
              :null
}

export default connect(mapStateToProps)(OnBoardingBox);
