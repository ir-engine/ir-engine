import React from "react";
import styles from './style.module.scss';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import Snackbar from '@material-ui/core/Snackbar';
import { connect } from "react-redux";
import TouchApp from "@material-ui/icons/TouchApp";
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

interface Props {
  message?: string;
  className?: string | '';
}

const mapStateToProps = (state: any): any => {
  return {   
  };
};


const TooltipContainer = (props: Props) =>{
  const interactTip = isMobileOrTablet() ? <TouchApp /> : 'E';
  return props.message ? 
            <Snackbar anchorOrigin={{vertical: 'bottom',horizontal: 'center'}} 
            className={styles.TooltipSnackBar} open={true} 
            autoHideDuration={10000}>
              <section className={styles.innerHtml+' MuiSnackbarContent-root'}>
                <ErrorOutlineIcon color="secondary" />
                Press {interactTip} to {props.message}
              </section>
            </Snackbar>
          :null;
};

export default connect(mapStateToProps)(TooltipContainer);
