import { Dialog, Fab, Snackbar, Tooltip, DialogTitle, DialogContent,DialogContentText, DialogActions,Button } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import './style.scss';

export const BeginnerBox: FunctionComponent = (props:any) => {
  const [snackBarOpened, setSnackBarOpened] = React.useState(localStorage.getItem('skipHelpHighlight') === 'true' ? false : true);
  const [dialogOpened, setDialogOpened] = React.useState(false);
  
  const handleCSnackBarlose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackBarOpened(false);
  };

  const handleClickDialogOpen = () => {
    setDialogOpened(true);
  };

  const handleDialogClose = () => {
    setDialogOpened(false);
  };
  const handleProDialogClose = () =>{
    localStorage.setItem('skipHelpHighlight','true');
    handleDialogClose();
  }

  const beginnerHintButton = 
    <>
      <Tooltip title="Info / Help" aria-label="Info / Help">
        <Fab onClick={handleClickDialogOpen} className="helpButton" color="secondary" aria-label="Info / Help">i</Fab>
      </Tooltip>
      <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          className='helpHintSnackBar'
          open={snackBarOpened}
          onClose={handleCSnackBarlose}
          autoHideDuration={10000}
          message="You can find some usefull tips Here &rarr;"        
        />

      <Dialog
        open={dialogOpened}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"OnBoarding Guidance"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          Welcome to the XREngine immersive store. You can hang out and explore this virtual place with others.Walk around and discover things to see and do. Invite your friends and share the experience.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}  variant="contained" color="primary">
            Ok
          </Button>
          <Button onClick={handleProDialogClose} variant="contained" color="secondary" autoFocus>
            I'm a pro, Skip
          </Button>
        </DialogActions>
      </Dialog>
    </>
  
  return beginnerHintButton;
};