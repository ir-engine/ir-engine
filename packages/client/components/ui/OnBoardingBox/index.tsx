import React, { useEffect, useState } from "react";

import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Button, Snackbar, SnackbarContent, Typography } from '@material-ui/core';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import store from "../../../redux/store";

import { Thumbsticks } from '@xr3ngine/engine/src/common/enums/Thumbsticks';
import { GamepadButtons } from '@xr3ngine/engine/src/input/enums/GamepadButtons';
import { CharacterInputSchema } from "@xr3ngine/engine/src/templates/character/CharacterInputSchema";

import styles from './OnBoardingBox.module.scss';
import { DefaultInput } from "@xr3ngine/engine/src/templates/shared/DefaultInput";
import { getMutableComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { Entity } from "@xr3ngine/engine/src/ecs/classes/Entity";

import { IconSwipe } from '../IconSwipe';
import { IconLeftClick } from '../IconLeftClick';
import { Microphone } from '@styled-icons/boxicons-regular/Microphone';
import { TouchApp, Videocam } from "@material-ui/icons";
import FaceIcon from '@material-ui/icons/Face';

import { IconKeyboardMove } from "../IconKeyboardMove";

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

interface Props {
  onBoardingStep?: number;
  actorEntity? : Entity;
}

const OnBoardingBox = ({ onBoardingStep,actorEntity } : Props) =>{
  if(!actorEntity){return '' as any;}
  const [hiddenSnackbar, setHiddenSnackBar] = useState(false);
  const cardFadeInOut = step =>{    
    const fadeOutInterval = setTimeout(()=>setHiddenSnackBar(true),0);
    const fadeIntInterval = setTimeout(()=>{
      store.dispatch(setAppOnBoardingStep(step));
      step !== generalStateList.ALL_DONE && setHiddenSnackBar(false);
    }, 500);
    if(step === generalStateList.TUTOR_UNMUTE){
      const unmuteInterval = setTimeout(()=>{
        store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));
        clearInterval(unmuteInterval);
      }, 8000);
    }
    if(step === generalStateList.TUTOR_END){
      clearInterval(fadeOutInterval);
      clearInterval(fadeIntInterval);
    }
  };
  const addLookAroundEventListeners = () =>{

    const InputComponent = getMutableComponent(actorEntity, Input);
    InputComponent.schema.inputAxisBehaviors[DefaultInput.LOOKTURN_PLAYERONE] = {changed : [{behavior:actorLooked}]};
  };

  const actorLooked = () =>{
    cardFadeInOut(generalStateList.TUTOR_MOVE);
    const InputComponent = getMutableComponent(actorEntity, Input);
    delete InputComponent.schema.inputAxisBehaviors[DefaultInput.LOOKTURN_PLAYERONE];
   
    //gamepad
    const gamepadInputMap = {
      [GamepadButtons.DPad1]: DefaultInput.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: DefaultInput.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: DefaultInput.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
    };
    InputComponent.schema.gamepadInputMap.axes[Thumbsticks.Left] =  DefaultInput.MOVEMENT_PLAYERONE;           
    InputComponent.schema.gamepadInputMap.buttons = Object.assign(InputComponent.schema.gamepadInputMap.buttons, gamepadInputMap) ;

    //add keyboard
    const keyboardInputMap = {
      w: DefaultInput.FORWARD,
      a: DefaultInput.LEFT,
      s: DefaultInput.BACKWARD,
      d: DefaultInput.RIGHT};
    InputComponent.schema.keyboardInputMap = Object.assign(InputComponent.schema.keyboardInputMap, keyboardInputMap) ;
    //keyboard
    InputComponent.schema.inputButtonBehaviors[DefaultInput.FORWARD].started.push({behavior:actorMoved});
    InputComponent.schema.inputButtonBehaviors[DefaultInput.BACKWARD].started.push({behavior:actorMoved});
    InputComponent.schema.inputButtonBehaviors[DefaultInput.LEFT].started.push({behavior:actorMoved});
    InputComponent.schema.inputButtonBehaviors[DefaultInput.RIGHT].started.push({behavior:actorMoved});
        
    //
    InputComponent.schema.inputAxisBehaviors[DefaultInput.MOVEMENT_PLAYERONE].changed.push({behavior:actorMoved});
  };

  const actorInteracted = () =>{
    cardFadeInOut(generalStateList.TUTOR_UNMUTE);
    const InputComponent = getMutableComponent(actorEntity, Input);
    InputComponent.schema = CharacterInputSchema;
  };

  const actorMoved = () =>{
    const InputComponent = getMutableComponent(actorEntity, Input);
    //keyboard
    InputComponent.schema.inputButtonBehaviors[DefaultInput.FORWARD].started.pop();
    InputComponent.schema.inputButtonBehaviors[DefaultInput.BACKWARD].started.pop();
    InputComponent.schema.inputButtonBehaviors[DefaultInput.LEFT].started.pop();
    InputComponent.schema.inputButtonBehaviors[DefaultInput.RIGHT].started.pop();
    //joystick
    InputComponent.schema.inputAxisBehaviors[DefaultInput.MOVEMENT_PLAYERONE].started.pop();
    
    InputComponent.schema.keyboardInputMap.e = DefaultInput.INTERACT;
    InputComponent.schema.gamepadInputMap.buttons[GamepadButtons.A] = DefaultInput.INTERACT;

    InputComponent.schema.inputButtonBehaviors[DefaultInput.INTERACT] = {ended : [{behavior:actorInteracted}]};
    cardFadeInOut(generalStateList.TUTOR_INTERACT);
  };

  var title = null;
  var message = null;
  var imageTip = null;
    switch(onBoardingStep){
      case generalStateList.TUTOR_LOOKAROUND:
            title = 'Look and Turn';
            message = isMobileOrTablet() ? 'Touch and Drag to look around' : 'Use Mouse to look around'; 
            imageTip = isMobileOrTablet() ? 
                <IconSwipe color="secondary" className={styles.IconSwipe} width="99" height="103" viewBox="0 0 99 103"/>
                :
                <IconLeftClick color="secondary" className={styles.IconLeftClick}  width="71" height="73" viewBox="0 0 71 73" />; 
            addLookAroundEventListeners(); 
            break;      
      case generalStateList.TUTOR_MOVE: 
            title = 'Movement';
            message= isMobileOrTablet() ? ' Use joystick to move' : 'Use keyboard to move';
            imageTip = isMobileOrTablet() ? ' ' : <IconKeyboardMove width="117" height="77" viewBox="0 0 117 77" />;
            break;
      case generalStateList.TUTOR_INTERACT: 
            title = 'Interaction';
            message= isMobileOrTablet() ? 
                  'Use to interact' : 
                  <span>Press <span className={styles.keyButton}>E</span> to interact</span>; 
            isMobileOrTablet() && (imageTip = <TouchApp color="secondary" className={styles.TouchApp} />); break;
      case generalStateList.TUTOR_UNMUTE: 
            title = 'Communication';
            message='Enable one of the inputs at the top of your screen.Try streaming your expressions to your avatar!';  
            imageTip = isMobileOrTablet() ? 
                        <section className={styles.columnImageHints}><Microphone /><Videocam /><FaceIcon /></section> :
                        <section className={styles.inlineImageHints}>
                          <span><Microphone />Microphone</span>
                          <span><Videocam />Video</span>
                          <span><FaceIcon />Expression</span>
                        </section>;
            break;
      default : message= '';break;
    } 
 
  const snackBarClasses = {
    root: styles.helpHintSnackBar +' '+ styles[generalStateList[onBoardingStep].toLowerCase()],
    // anchorOriginBottomCenter: styles.bottomPos
  }
    hiddenSnackbar && (snackBarClasses.root += ' '+styles.hidden);
  
  const vertical = onBoardingStep === generalStateList.TUTOR_UNMUTE ? 'top' : 'bottom';
  return message ? 
      <Snackbar 
      anchorOrigin={{vertical, horizontal: 'center'}} 
      classes={snackBarClasses}
      open={true}>
          <>
            <div className={styles.textHint}>
              {title && <Typography variant="h2" color="secondary" align="left">{title}</Typography>}            
              <p>{message}</p>
            </div>
            <div className={styles.imageHint}>{imageTip}</div>
          </>
      </Snackbar>
    : null;
};

export default connect(mapStateToProps)(OnBoardingBox);
