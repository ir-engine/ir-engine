import { CharacterAvatars } from "@xr3ngine/engine/src/templates/character/CharacterAvatars";
import React from "react";
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { TooltipContainer } from "../../editor/layout/Tooltip";
import OnBoardingBox from "../OnBoardingBox";
import OnBoardingDialog from "../OnBoardingDialog";

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const TutorialContainer = (props) =>{
  const { onBoardingStep }  = props;

  return <>
    <OnBoardingDialog avatarsList={CharacterAvatars}   />
    <OnBoardingBox />
    <TooltipContainer />
  </>;
};

export default connect(mapStateToProps)(TutorialContainer);
