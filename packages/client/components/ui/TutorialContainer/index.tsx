import React from "react";

import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Button, Snackbar, SnackbarContent } from '@material-ui/core';
import { connect } from "react-redux";
import { selectAppOnBoardingStep } from "../../../redux/app/selector";
import { generalStateList, setAppOnBoardingStep } from '../../../redux/app/actions';
import store from "../../../redux/store";
import OnBoardingBox from "../OnBoardingBox";
import { TooltipContainer } from "../../editor/ui/layout/Tooltip";
import OnBoardingDialog from "../OnBoardingDialog";
import { CharacterAvatars } from "@xr3ngine/engine/src/templates/character/CharacterAvatars";

const mapStateToProps = (state: any): any => {
  return {   
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};


const TutorialContainer = (props) =>{
  const { onBoardingStep }  = props;

  return <>
    <OnBoardingDialog avatarsList={CharacterAvatars} onAvatarChange={}  />
    <OnBoardingBox />
    <TooltipContainer />
  </>;
};

export default connect(mapStateToProps)(TutorialContainer);
