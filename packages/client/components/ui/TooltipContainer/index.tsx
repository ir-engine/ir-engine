import React from "react";

import styles from './TooltipContainer.module.scss';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import Snackbar from '@material-ui/core/Snackbar';
import { connect } from "react-redux";
import TouchApp from "@material-ui/icons/TouchApp";

interface Props {
  message?: string;
  className?: string | '';
}

const mapStateToProps = (state: any): any => {
  return {   
  };
};


const TooltipContainer = (props: Props) =>{
  const interactTip = isMobileOrTablet() ? <TouchApp /> : <span className={styles.keyItem}>E</span>;
  return !isMobileOrTablet() && props.message ? 
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
            className={styles.TooltipSnackBar} open={true} >
              <section className={styles.innerHtml+' MuiSnackbarContent-root'}>Press {interactTip} to {props.message}</section>
            </Snackbar>
          :null;
};

export default connect(mapStateToProps)(TooltipContainer);
