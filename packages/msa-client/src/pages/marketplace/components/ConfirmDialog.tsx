import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function ConfirmDialog(props) {
  const handleClick = (t) => {
    if (typeof props.handler != 'undefined') props.handler(t);
  };
  return (
    <Dialog
      open={props.open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{props.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
      <Button onClick={() => handleClick(false)} color="primary">
        {props.buttonCancel ?? "Cancel" }
      </Button>
      <Button onClick={() => handleClick(true)} color="primary">
        {props.buttonConfirm ?? "Confirm" }
      </Button>
      </DialogActions>
    </Dialog>
  );
}
