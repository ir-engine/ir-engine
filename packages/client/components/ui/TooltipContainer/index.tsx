import React from "react";

import './style.scss';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import Snackbar from '@material-ui/core/Snackbar';
import { connect } from "react-redux";

interface Props {
  message?: string;
  className?: string | '';
}

const mapStateToProps = (state: any): any => {
  return {   
  };
};


const TooltipContainer = (props : Props) =>{
  console.log('props.message', props.message)
       
  return !isMobileOrTablet() && props.message ? 
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
            className={`helpHintSnackBar TooltipSnackBar`} open={true} 
            autoHideDuration={10000}>
                <section className='MuiSnackbarContent-root innerHtml'>Press <span className="keyItem" >E</span> to {props.message}</section>
            </Snackbar>
          :null
}

export default connect(mapStateToProps)(TooltipContainer);
