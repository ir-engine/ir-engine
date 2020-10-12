import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Router from 'next/router';
import {Dialog, DialogTitle, DialogContent, Button, IconButton, Typography} from '@material-ui/core';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import DialogContent from '@material-ui/core/DialogContent';
// import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
// import Typography from '@material-ui/core/Typography';
import { selectDialogState } from '../../../redux/dialog/selector';
import { closeDialog } from '../../../redux/dialog/service';

import './style.scss';

interface Props {
  dialog: any;
  values:any;
  children: any;
  isCloseButton:boolean;
  closeDialog: typeof closeDialog;
}

const mapStateToProps = (state: any): any => {
  return {
    dialog: selectDialogState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  closeDialog: bindActionCreators(closeDialog, dispatch)
});

const UIDialog = (props: Props): any => {


  console.log('+++props', props)
  const { dialog, values, closeDialog, children, isCloseButton = false} = props;
  const content = dialog.get('content') ? dialog.get('content') : values ?  values.content : '';

  useEffect(() => {
    Router.events.on('routeChangeStart', () => {
      closeDialog();
    });
  }, []);

  const handleClose = (e: any): void => {
    e.preventDefault();
    closeDialog();
  };


  return (
    <Dialog open={values ? values.isOpened : false} onClose={handleClose} aria-labelledby="xr-dialog" color="background">
      <DialogTitle disableTypography className="dialogTitle">
        { content && content.title && (<Typography variant="h6">{content.title}</Typography>)}
        {isCloseButton && (<IconButton
          aria-label="close"
          className="dialogCloseButton"
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>)}
      </DialogTitle>

      <DialogContent className="dialogContent">
        {/* {content && content.children} */}
        <section className="innerText">{children}</section>
        {values && values.submitButtonText && 
          (<Button variant="contained" color="primary" 
              onClick={values.submitButtonAction}>{values.submitButtonText}</Button>)}
      </DialogContent>
    </Dialog>
  );
};

const DialogWrapper = (props: any): any => <UIDialog {...props } />;

export default connect(mapStateToProps, mapDispatchToProps)(DialogWrapper);
