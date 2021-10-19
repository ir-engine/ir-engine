import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function InputForm(props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(props.defaultValue ?? "");
  const [secondaryValue, setSecondaryValue] = React.useState(props.defaultSecondaryValue ?? "");

  const submit = () => {
    if (typeof props.onClick != 'undefined') props.onClick(value, secondaryValue);
    setOpen(false);
    setValue(props.defaultValue ?? "");
    setSecondaryValue(props.defaultSecondaryValue ?? "");
  };
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {React.cloneElement(props.children, {onClick: handleClick})}
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{props.content}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={props.inputLabel}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          { props.secondaryInput ? 
            <TextField
              margin="dense"
              label={props.secondaryInput}
              value={secondaryValue}
              onChange={(e) => setSecondaryValue(e.target.value)}
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            /> : "" }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={submit} color="primary">{props.buttonLabel}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
