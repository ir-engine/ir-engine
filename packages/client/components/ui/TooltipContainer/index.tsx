import React from "react";

import styles from './TooltipContainer.module.scss';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import Snackbar from '@material-ui/core/Snackbar';
import { connect } from "react-redux";
import { SnackbarContent } from "@material-ui/core";

interface Props {
  message?: string;
  className?: string | '';
}

const mapStateToProps = (state: any): any => {
  return {   
  };
};


const TooltipContainer = (props: Props) =>{
  return !isMobileOrTablet() && props.message ? 
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
            className={styles.TooltipSnackBar} open={true} 
            autoHideDuration={10000}>
              <section className={styles.innerHtml+' MuiSnackbarContent-root'}>Press <span className={styles.keyItem}>E</span> to {props.message}</section>
            </Snackbar>
          :null;
};

export default connect(mapStateToProps)(TooltipContainer);
