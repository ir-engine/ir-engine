import React from 'react';
// import AppBar from '@material-ui/core/AppBar';
import styles from './UserMenu.module.scss';
import { Button, MenuItem, Menu, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, IconButton } from '@material-ui/core';
import { generalStateList, setAppSpecificOnBoardingStep } from '../../../redux/app/actions';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import store from '../../../redux/store';
import { Network } from '@xr3ngine/engine/src/networking/components/Network';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { connect } from 'react-redux';
interface Props {
    login?: boolean;
    authState?:any;
}

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    authState: selectAuthState(state),
  };
};


const UserMenu = (props: Props): any => {    
  const { login, authState} = props;
  const selfUser = authState.get('user');
  console.log('selfUser', selfUser)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTutorialClick = () =>{
    setAnchorEl(null);
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.TUTOR_LOOKAROUND));
  }

  const handleAvatarChangeClick = () =>{
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.AVATAR_SELECTION));
    setAnchorEl(null);
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickClose = () => {
    setOpen(false);
  };

  const handleChangeNameClick = () =>{
    setAnchorEl(null);
    handleClickOpen();
  }
  return (
    <>
    <section className={styles.appbar}>
      {/* <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          {selfUser ? selfUser.name : ''}
          <MoreVertIcon />
        </IconButton> */}
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        { selfUser ? selfUser.name : ''}
          <MoreVertIcon />
        </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={()=>handleChangeNameClick()}>Change Name</MenuItem>
        <MenuItem onClick={handleAvatarChangeClick}>Change Avatar</MenuItem>
        <MenuItem onClick={handleClose}>Share with a friend</MenuItem>
        <MenuItem onClick={handleTutorialClick}>Tutorial</MenuItem>
      </Menu>
    </section>

      <Dialog open={open} onClose={handleClickClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Change your Name</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          value={selfUser ? selfUser.name : ''}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleClose} color="primary">
          Save
        </Button>
      </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(mapStateToProps)(UserMenu);