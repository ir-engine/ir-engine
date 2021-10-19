import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export default function SnackbarButton(props) {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    if (typeof props.onClick != 'undefined') props.onClick();
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    setOpen(false);
    if (reason === 'clickaway') {
      return;
    }

  };

  return (  
    <>
      {React.cloneElement(props.children, {onClick: handleClick})}
      <Snackbar
        style={{position:"fixed"}}
        open={open}
        autoHideDuration={6000}
        anchorOrigin={props.anchorOrigin}
        onClose={handleClose}
        message={props.message}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        } 
      /> 
    </>
  );
}