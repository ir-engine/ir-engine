import React, { useRef, useState } from 'react';
import styles from './UserMenu.module.scss';
import { Button, MenuItem, Menu, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Fab } from '@material-ui/core';
import { generalStateList, setAppSpecificOnBoardingStep } from '../../../redux/app/actions';
import MenuIcon from '@material-ui/icons/Menu';
import ShareIcon from '@material-ui/icons/Share';
import store from '../../../redux/store';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { updateUsername } from '../../../redux/auth/service';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
interface Props {
    login?: boolean;
    authState?:any;
    updateUsername?: typeof updateUsername;
}

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    authState: selectAuthState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateUsername: bindActionCreators(updateUsername, dispatch)
});


const UserMenu = (props: Props): any => {    
  const { login, authState} = props;
  const selfUser = authState.get('user');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogType, setDialogType] = useState('username');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTutorialClick = () =>{
    setAnchorEl(null);
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.TUTOR_LOOKAROUND, true));
  }

  const handleAvatarChangeClick = () =>{
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.AVATAR_SELECTION, false));
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
    setDialogType('username');
    setAnchorEl(null);
    handleClickOpen();
  }

  const handleShareClick = () =>{
    setDialogType('share');
    setAnchorEl(null);
    handleClickOpen();
  }

  const [username, setUsername] = useState(selfUser.name);

  const handleUsernameChange = (e: any): void => {
    const newName = e.target.value;
    setUsername(newName);
  };

  const updateUsername = async (): Promise<void> => {
    await props.updateUsername(selfUser.id, username);
    handleClickClose();
  };

  const invitationLink = window.location.href;
  const refLink = useRef(null);
  const copyCodeToClipboard = (e) => {    
    refLink.current.select();
    document.execCommand("copy");
    e.target.focus();
  }

  const postTitle = 'AR/VR world';
  const siteTitle = 'XREngine';
  const handleMobileShareOnClick = () =>{
    if (navigator.share) {
      navigator
        .share({
          title: "`${postTitle} | ${siteTitle}`,",
          text: `Check out ${postTitle} on ${siteTitle}`,
          url: document.location.href,
        })
        .then(() => {
          console.log('Successfully shared');
        })
        .catch(error => {
          console.error('Something went wrong sharing the world', error);
        });
    }
  }

  return (
    <>
    <section className={styles.appbar}>
        <span className={styles.userTitle}>{ selfUser ? selfUser.name : ''}
           <Fab color="primary" onClick={handleClick}><MenuIcon  /></Fab>
        </span>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}   
        getContentAnchorEl={null}     
      >
        <MenuItem onClick={()=>handleChangeNameClick()}>Change Name</MenuItem>
        <MenuItem onClick={handleAvatarChangeClick}>Change Avatar</MenuItem>
        <MenuItem onClick={handleShareClick}>Share Location</MenuItem>
        <MenuItem onClick={handleTutorialClick}>Tutorial</MenuItem>
      </Menu>
    </section>

      <Dialog open={open} onClose={handleClickClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{dialogType === 'username' ? 'Change your Name':'Share Location'}</DialogTitle>
        <DialogContent>
          {dialogType === 'username' ? 
          <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="username"
                  label="Your Name"
                  name="name"
                  autoFocus
                  defaultValue={selfUser.name}
                  onChange={(e) => handleUsernameChange(e)}
              /> : 
              <section>
                   { isMobileOrTablet() && navigator.share ? 
                      (<>
                        <p>Share world to other users to have them join you</p>
                        <Button variant="outlined" color="primary" onClick={handleMobileShareOnClick}>
                          <ShareIcon />Share
                        </Button>
                      </>)
                  : (<><p>Send this link to other users to have them join you</p>
                  <p>(click on link to copy)</p>
                  <textarea readOnly className={styles.linkField} ref={refLink} onClick={copyCodeToClipboard} value={invitationLink} /></>)
                  }
              </section>
              }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          {dialogType === 'username' && 
            <Button onClick={updateUsername} variant="outlined" color="primary">
              Save
            </Button>}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);