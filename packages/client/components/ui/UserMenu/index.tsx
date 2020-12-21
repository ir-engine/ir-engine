import React, { useEffect, useRef, useState } from 'react';
import styles from './UserMenu.module.scss';
import { Button, Drawer, Typography, Card, CardActionArea, Snackbar } from '@material-ui/core';
import { generalStateList, setAppSpecificOnBoardingStep } from '../../../redux/app/actions';
import ToysIcon from '@material-ui/icons/Toys';
import PolicyIcon from '@material-ui/icons/Policy';
import LinkIcon from '@material-ui/icons/Link';
import SettingsIcon from '@material-ui/icons/Settings';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import store from '../../../redux/store';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import { setActorAvatar } from "@xr3ngine/engine/src/templates/character/behaviors/setActorAvatar";

import { updateUsername } from '../../../redux/auth/service';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { showDialog } from '../../../redux/dialog/service';
import SignIn from '../Auth/Login';
import { logoutUser } from '../../../redux/auth/service';
import { Network } from '@xr3ngine/engine/src/networking/components/Network';
import { loadActorAvatar } from '@xr3ngine/engine/src/templates/character/behaviors/loadActorAvatar';
import UserSettings from '../Profile/UserSettings';
import { LazyImage } from '../LazyImage';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import { removeUser } from '../../../redux/auth/service';
interface Props {
    login?: boolean;
    authState?:any;
    updateUsername?: typeof updateUsername;
    logoutUser?: typeof logoutUser;
    showDialog?: typeof showDialog;
    removeUser?: typeof removeUser;
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
  removeUser: bindActionCreators(removeUser, dispatch),
});


const UserMenu = (props: Props): any => {    
  const { login, authState, logoutUser, removeUser, showDialog} = props;
  const selfUser = authState.get('user');
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [username, setUsername] = useState(selfUser?.name);
  const [drawerType, setDrawerType] = useState('default');

  const invitationLink = window.location.href;
  const refLink = useRef(null);
  const postTitle = 'AR/VR world';
  const siteTitle = 'The Overlay';
  const anchor = 'right';
  const worldName = 'Lobbyworld Demo';

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  type Anchor = 'top' | 'left' | 'bottom' | 'right';


  const handleTutorialClick = (event: React.KeyboardEvent | React.MouseEvent) =>{
    toggleDrawer(anchor, false)(event);
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.TUTOR_LOOKAROUND, true));
  };

  const handleAccountDeleteClick = () => setDrawerType('accountDelete');
  const handleAvatarChangeClick = () => setDrawerType('avatar');
  const handleDeviceSetupClick = () => setDrawerType('device');
  
  const copyCodeToClipboard = () => {    
    refLink.current.select();
    document.execCommand("copy");
    setOpenSnackBar(true);
  };

  const confirmAccountDelete = () => {
    removeUser(selfUser.id);
    setDrawerType('default');
  };

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
  };
  
  const toggleDrawer = (anchor: Anchor, open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    setIsOpenDrawer(open);
    if (
      event &&
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });

    open === true ? window.document.querySelector('body').classList.add('menuDrawerOpened')
               : window.document.querySelector('body').classList.remove('menuDrawerOpened');
  };

  const handleLogin = () => {
    setDrawerType('login');
  };

  const handleLogout = () => {
    logoutUser();
  };


  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const handleCloseSnackBar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackBar(false);
  };

  const renderSuccessMessage = ()=>
    <Snackbar open={openSnackBar} 
    autoHideDuration={3000} 
    onClose={handleCloseSnackBar} 
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}>
      <section>Link successfully added to clipboard</section>
    </Snackbar>;

  const [actorEntity, setActorEntity] = useState(null);
  const [actorAvatarId, setActorAvatarId] = useState('Rose');

    useEffect(() => {

      const actorEntityWaitInterval = setInterval(() => {
        if (Network.instance?.localClientEntity) {
          setActorEntity(Network.instance.localClientEntity);
          clearInterval(actorEntityWaitInterval);
        }
      }, 300);
    }, []);

    useEffect(() => {
      if (actorEntity) {
        setActorAvatar(actorEntity, {avatarId: actorAvatarId});
        loadActorAvatar(actorEntity);
      }
    }, [ actorEntity, actorAvatarId ]);
   
//filter avatars by some attribute
const avatarsForRender = CharacterAvatars.filter(avatar=>avatar.id !== 'Animation');
const renderAvatarSelectionPage = () =><>
      <Typography variant="h2" color="primary"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Change Avatar</Typography>
      <section className={styles.avatarCountainer}>
          {avatarsForRender.map(characterAvatar=>
              <Card key={characterAvatar.id} className={styles.avatarPreviewWrapper}> 
                <CardActionArea onClick={()=>setActorAvatarId(characterAvatar.id)} >
                  <LazyImage
                    key={characterAvatar.id}
                    src={'/static/'+characterAvatar.id.toLocaleLowerCase()+'.png'}
                    alt={characterAvatar.title}
                  />
                </CardActionArea>
              </Card>
            )}
      </section>
      </>;

const renderDeviceSetupPage = () =><>
  <Typography variant="h2" color="primary"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Device Setup</Typography>
  <UserSettings />
</>;

const renderLoginPage = () =><>
  <Typography variant="h2" color="primary"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Login</Typography>
  <SignIn />
</>;

const renderAccountDeletePage = () => <>
  <Typography variant="h2" color="primary"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Delete Account</Typography>
  <div>
    <Typography variant="h5" color="primary" className={styles.header}>Delete account?</Typography>
    <div className={styles.deleteAccountButtons}>
      <Button
          onClick={() => setDrawerType('default')}
          startIcon={<ClearIcon />}
          variant="contained"
      >
        Cancel
      </Button>
      <Button
          onClick={() => confirmAccountDelete()}
          startIcon={<DeleteIcon />}
          variant="contained"
          color='secondary'
      >
        Confirm
      </Button>
    </div>
  </div>
</>;

const renderHorizontalItems = () => 
  <section className={styles.horizontalContainer}>
          {(!isMobileOrTablet() || !navigator.share) && <textarea readOnly className={styles.linkField} ref={refLink} value={invitationLink} />}
          <Typography variant="h2" align="center" onClick={() => isMobileOrTablet() && navigator.share ? handleMobileShareOnClick() : copyCodeToClipboard()}><LinkIcon color="primary" />Share</Typography>
          <Typography variant="h2" align="center" onClick={(event)=>handleTutorialClick(event)}><VideoLibraryIcon color="primary" />Tutorial</Typography>    
  </section>;

const renderUserMenu = () =><>
          <Typography variant="h1" color="primary"><ArrowBackIosIcon color="primary" onClick={toggleDrawer(anchor, false)} />{worldName}</Typography>
          {renderHorizontalItems()}
          {/* <AccountCircleIcon color="primary" className={styles.userPreview} /> */}
          {/* <span className={styles.userTitle}>{ selfUser ? selfUser?.name : ''}</span> */}
          {/* <Button variant="outlined" color="primary" onClick={handleAvatarChangeClick}>Change Avatar</Button> */}
          { selfUser?.userRole === 'guest' ? 
                <>
                  <Button variant="outlined" color="primary" onClick={handleLogin}>Login</Button>
                  <Button variant="contained" color="primary">Create Account</Button>
                </> :
                <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>}
          { selfUser?.userRole !== 'guest' && <Button variant="outlined" color="primary" onClick={handleAccountDeleteClick}>Delete account</Button>}
          <section className={styles.placeholder} />
          <Typography variant="h2" align="left" onClick={handleDeviceSetupClick}><SettingsIcon color="primary" /> Settings</Typography>
          <Typography variant="h2" align="left"><ToysIcon color="primary" /> About</Typography>
          <Typography variant="h2" align="left"><PolicyIcon color="primary" /> Privacy & Terms</Typography>
          {renderSuccessMessage()}
      </>;

const renderDrawerContent = () =>{
  switch(drawerType){
    case 'avatar': return renderAvatarSelectionPage();
    case 'device': return renderDeviceSetupPage();
    case 'login': return renderLoginPage();
    case 'accountDelete': return renderAccountDeletePage();
    default: return renderUserMenu();
  }
};

  return (
        <section key={anchor} className={styles.anchorContainer}>
          <span className={styles.anchorDrawer} onClick={toggleDrawer(anchor, isOpenDrawer === true ? false : true)} ></span>
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            className={styles.drawer}
            BackdropProps={{invisible:true, open:false }}
          >
            {renderDrawerContent()}            
          </Drawer>
        </section>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
