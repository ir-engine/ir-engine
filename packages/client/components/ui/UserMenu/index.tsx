import React, { useRef, useState } from 'react';
import styles from './UserMenu.module.scss';
import { Button, MenuItem, TextField, Drawer, Typography } from '@material-ui/core';
import { generalStateList, setAppSpecificOnBoardingStep } from '../../../redux/app/actions';
import EditIcon from '@material-ui/icons/Edit';
import MenuIcon from '@material-ui/icons/Menu';
import ShareIcon from '@material-ui/icons/Share';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Tooltip from '@material-ui/core/Tooltip';
import store from '../../../redux/store';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { updateUsername } from '../../../redux/auth/service';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { showDialog } from '../../../redux/dialog/service';
import SignIn from '../Auth/Login';
import { logoutUser } from '../../../redux/auth/service';
interface Props {
    login?: boolean;
    authState?:any;
    updateUsername?: typeof updateUsername;
    logoutUser?: typeof logoutUser;
    showDialog?: typeof showDialog;
}

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    authState: selectAuthState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateUsername: bindActionCreators(updateUsername, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch),
});


const UserMenu = (props: Props): any => {    
  const { login, authState, logoutUser, showDialog} = props;
  console.log('props', props)
  console.log('authState', authState.get('user'))
  const selfUser = authState.get('user');
  const [isEditName, setIsEditName] = useState(false);
  const [username, setUsername] = useState(selfUser.name);
  const invitationLink = window.location.href;
  const refLink = useRef(null);
  const postTitle = 'AR/VR world';
  const siteTitle = 'XREngine';
  const anchor = 'right';
  const worldName = 'Lobbyworld Demo';

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  type Anchor = 'top' | 'left' | 'bottom' | 'right';

  const handleEditClick = () => {
    setIsEditName(true);
  };

  const handleTutorialClick = () =>{
    toggleDrawer(anchor, false)
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.TUTOR_LOOKAROUND, true));
  }

  const handleAvatarChangeClick = () =>{
    toggleDrawer(anchor, false)
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.AVATAR_SELECTION, false));
  }

  const handleUsernameChange = (e: any): void => {
    const newName = e.target.value;
    setUsername(newName);
  };

  const updateUsername = async (): Promise<void> => {
    await props.updateUsername(selfUser.id, username);
    setIsEditName(false)
  };
  
  const copyCodeToClipboard = (e) => {    
    refLink.current.select();
    document.execCommand("copy");
    // e.target.focus();
  }
  
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
  
  const toggleDrawer = (anchor: Anchor, open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const handleLogin = () => {
    const params = new URLSearchParams(document.location.search);
    const showLoginDialog = params.get('login');
    if (showLoginDialog === String(true)) {
      showDialog({ children: <SignIn /> });
    }
  };

  const handleLogout = () => {
    logoutUser();
  };

  const renderChangeNameForm = () =>
      <section>
        {isEditName === true ? (<section>
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
            />
            <Button onClick={()=>setIsEditName(false)} variant="outlined" color="secondary" className={styles.autoWidth}>
              Cancel
            </Button>
            <Button onClick={updateUsername} variant="outlined" color="primary"className={styles.autoWidth}>
              Save
            </Button>
        </section>) 
                : 
        (<span className={styles.userTitle}>
          <ArrowBackIosIcon onClick={toggleDrawer(anchor, false)} />
          <span>{ selfUser ? selfUser.name : ''}</span>
           <Tooltip title="Edit Username"><EditIcon color="primary" onClick={handleEditClick}  /></Tooltip>
        </span>)}
      </section>;


const renderShareLocation = () =>
      <section>
        <p className={styles.userTitle}>
          <span>{invitationLink}</span>
          <Tooltip title="Share"><ShareIcon  color="primary" onClick={() => isMobileOrTablet() && navigator.share ? handleMobileShareOnClick() : copyCodeToClipboard()}/></Tooltip>
        </p>
        {(!isMobileOrTablet() || !navigator.share) && <textarea readOnly className={styles.linkField} ref={refLink} value={invitationLink} />}
    </section>;

  return (
        <section key={anchor} className={styles.anchorContainer}>
          <Button className={styles.anchorDrawer} onClick={toggleDrawer(anchor, true)}><MenuIcon /></Button>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            className={styles.drawer}
          >
            {renderChangeNameForm()}
            <Typography variant="h1">{worldName}</Typography>
            {renderShareLocation()}
            <Typography variant="h2" color="primary" onClick={handleAvatarChangeClick}>Change Avatar</Typography>
            <Typography variant="h2" color="primary" onClick={handleTutorialClick}>Tutorial</Typography>
            {selfUser && selfUser.userRole === 'guest' && <Typography variant="h2" color="primary" onClick={handleLogin}>Login</Typography>}
            {selfUser && selfUser.userRole !== 'guest' && <Typography variant="h2" color="primary" onClick={handleLogout}>Logout</Typography>}
            <section className={styles.placeholder}></section>
            <Typography variant="h2" color="secondary">About</Typography>
            <Typography variant="h2" color="secondary">Privacy & Terms</Typography>
          </Drawer>
        </section>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);