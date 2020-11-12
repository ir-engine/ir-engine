import React, { useEffect } from "react";

import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Button, Snackbar, SnackbarContent } from '@material-ui/core';
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
import { TouchApp } from "@material-ui/icons";

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

  const addLookAroundEventListeners = () =>{
    const InputComponent = getMutableComponent(actorEntity, Input);
    InputComponent.schema.inputAxisBehaviors[DefaultInput.LOOKTURN_PLAYERONE] = {changed : [{behavior:actorLooked}]};
  };

  const actorLooked = () =>{
    store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_MOVE));
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
    store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_UNMUTE));
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
    store.dispatch(setAppOnBoardingStep(generalStateList.TUTOR_INTERACT));
  };

  const exitTutorialHandle = () => {
    const InputComponent = getMutableComponent(actorEntity, Input);
    InputComponent.schema = CharacterInputSchema;
    store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));
  };

  var message = '';
  var imageTip = null;

    switch(onBoardingStep){
      case generalStateList.TUTOR_LOOKAROUND:message='Touch and Drag to look around'; 
                                            imageTip = isMobileOrTablet() ? <IconSwipe className={styles.IconSwipe} width="125.607" height="120.04" viewBox="0 0 125.607 120.04" />:<IconLeftClick className={styles.IconLeftClick}  width="136.742" height="144.242" viewBox="0 0 136.742 144.242" />; 
                                            addLookAroundEventListeners(); 
                                            break;      
      case generalStateList.TUTOR_MOVE: message= isMobileOrTablet() ? ' Use joystick to move' : 'Use keybuttons W S A D to move'; break;
      case generalStateList.TUTOR_INTERACT: message= isMobileOrTablet() ? 'Use to interact' : 'Press E to interact'; 
                                            isMobileOrTablet() && (imageTip = <TouchApp className={styles.TouchApp} />); break;
      case generalStateList.TUTOR_UNMUTE: message='Tap to toggle Mic';  imageTip = <Microphone className={styles.Microphone} />;break;
      default : message= '';break;
    } 
 
  return message.length > 0 ? <>
      <section className={styles.exitButtonContainer}>
        <Button variant="contained" className={styles.exitButton} 
            onClick={exitTutorialHandle}>Exit Tutorial</Button>
      </section>
      <Snackbar 
      anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
      classes={{
        root: styles.helpHintSnackBar +' '+ styles[generalStateList[onBoardingStep].toLowerCase()]+ ' ' + styles[`isMobile${isMobileOrTablet()}`],
        anchorOriginBottomCenter: styles.bottomPos,                    
      }}
      open={true} 
      autoHideDuration={10000}>
          <section>
            {imageTip}
            <p>{message}</p>
          </section>
      </Snackbar>
    </>  : null;
};

export default connect(mapStateToProps)(OnBoardingBox);
