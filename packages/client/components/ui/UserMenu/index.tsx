import React, { useEffect, useRef, useState } from 'react';
import getConfig from 'next/config';

import styles from './UserMenu.module.scss';
import { Button, Drawer, Typography, Card, CardContent, Snackbar, TextField } from '@material-ui/core';
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
import { selectLocationState } from '../../../redux/location/selector';
import { selectInstanceConnectionState } from "../../../redux/instanceConnection/selector";
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import { getPseudoRandomAvatarIdByUserId } from '@xr3ngine/engine/src/templates/character/functions/pseudoRandomAvatar';
import { setActorAvatar } from "@xr3ngine/engine/src/templates/character/behaviors/setActorAvatar";

import { updateUsername, updateUserAvatarId } from '../../../redux/auth/service';
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
import CreateIcon from '@material-ui/icons/Create';
import CachedIcon from '@material-ui/icons/Cached';
import MailIcon from '@material-ui/icons/Mail';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import SmsIcon from '@material-ui/icons/Sms';
import GitHubIcon from '@material-ui/icons/GitHub';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { removeUser } from '../../../redux/auth/service';
import { selectScenesCurrentScene } from '../../../redux/scenes/selector';
import { FacebookIcon } from '../Icons/FacebookIcon';
import { GoogleIcon } from '../Icons/GoogleIcon';
import { LinkedInIcon } from '../Icons/LinkedInIcon';
import { TwitterIcon } from '../Icons/TwitterIcon';
import {endVideoChat, leave} from "../../../classes/transports/WebRTCFunctions";
import {provisionInstanceServer} from "../../../redux/instanceConnection/service";
import { joinWorld } from "@xr3ngine/engine/src/networking/functions/joinWorld";
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";

interface Props {
    login?: boolean;
    authState?:any;
    instanceConnectionState?: any;
    locationState?: any;
    updateUsername?: typeof updateUsername;
    updateUserAvatarId?: typeof updateUserAvatarId;
    logoutUser?: typeof logoutUser;
    showDialog?: typeof showDialog;
    removeUser?: typeof removeUser;
    currentScene?: any;
    provisionInstanceServer: any;
}

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    authState: selectAuthState(state),
    instanceConnectionState: selectInstanceConnectionState(state),
    locationState: selectLocationState(state),
    currentScene : selectScenesCurrentScene(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateUsername: bindActionCreators(updateUsername, dispatch),
  updateUserAvatarId: bindActionCreators(updateUserAvatarId, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch),
  removeUser: bindActionCreators(removeUser, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
});


const UserMenu = (props: Props): any => {    
  const {
      authState,
      instanceConnectionState,
      locationState,
      logoutUser,
      provisionInstanceServer,
      removeUser,
      currentScene,
      updateUsername,
      updateUserAvatarId
  } = props;
  const selfUser = authState.get('user');
  const currentLocation = locationState.get('currentLocation').get('location');

  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isEditUsername, setIsEditUsername] = useState(false);
  const [username, setUsername] = useState(selfUser?.name);
  const [drawerType, setDrawerType] = useState('default');

  const invitationLink = window.location.href;
  const refLink = useRef(null);
  const postTitle = 'AR/VR world';
  const siteTitle = 'XR3ngine';
  const anchor = 'right';
  const worldName = 'Loading...';

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  type Anchor = 'top' | 'left' | 'bottom' | 'right';

  const [waitingForLogout, setWaitingForLogout] = useState(false);
  const [waitingToRejoinWorld, setWaitingForRejoinWorld] = useState(false);

  const handleTutorialClick = (event: React.KeyboardEvent | React.MouseEvent) =>{
    toggleDrawer(anchor, false)(event);
    store.dispatch(setAppSpecificOnBoardingStep(generalStateList.TUTOR_LOOKAROUND, true));
  };

  const handleAccountDeleteClick = () => setDrawerType('accountDelete');
  const handleAvatarChangeClick = () => setDrawerType('avatar');
  const handleDeviceSetupClick = () => setDrawerType('device');
  const handleAccountSettings = () => setDrawerType('account');
  
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

  const handleLogin = () => setDrawerType('login');
  const handleLogout = async () => {
      if (currentLocation != null && currentLocation.slugifiedName != null) {
          await endVideoChat({endConsumers: true});
          await leave();
          setWaitingForLogout(true);
      }
      logoutUser();
      setDrawerType('default');
  };

  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const handleCloseSnackBar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackBar(false);
  };

  const handleShowEditUsername = () => setIsEditUsername(!isEditUsername);
  const handleUpdateUsername = () => {
    if(selfUser.name.trim() !== username.trim()){
      updateUsername(selfUser.id, username);
    }
    setIsEditUsername(false);
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
  const [actorAvatarId, setActorAvatarId] = useState(selfUser?.avatarId);

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
        updateUserAvatarId(selfUser.id, actorAvatarId);
      }
    }, [ actorEntity, actorAvatarId ]);

    useEffect(() => {
      selfUser && setUsername(selfUser.name);
    }, [ selfUser ]);

    useEffect(() => {
        console.log('Logout re-provision watcher');
        console.log(authState);
        console.log('waitingForLogout: ' + waitingForLogout);
        if (waitingForLogout === true && authState.get('authUser') != null && authState.get('user') != null && authState.get('user').userRole === 'guest') {
            setWaitingForLogout(false);
            // resetEngine();
            const instanceId = currentLocation.instances && currentLocation.instances.length > 0 ? currentLocation.instances[0].id : null;
            console.log('Re-provisioning logged out guest user onto location ' + currentLocation.slugifiedName);
            provisionInstanceServer(currentLocation.id, instanceId);
            setWaitingForRejoinWorld(true);
        }
    }, [authState]);

    useEffect(() => {
        console.log('Rejoin world watcher');
        console.log(Network.instance);
        if (waitingToRejoinWorld === true && instanceConnectionState.get('connected') === true) {
            setTimeout(() => {
                joinWorld();
            }, 3000);
        }
    }, [instanceConnectionState]);
   
const renderAvatarSelectionPage = () =><>
      <Typography variant="h1"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} focusable={true} />Select Avatar</Typography>
      <section className={styles.avatarCountainer}>
          {CharacterAvatars.map(characterAvatar=>
              <Card key={characterAvatar.id} className={styles.avatarPreviewWrapper}> 
                <CardContent onClick={()=>setActorAvatarId(characterAvatar.id)} >
                  <LazyImage
                    key={characterAvatar.id}
                    src={'/static/'+characterAvatar.id.toLocaleLowerCase()+'.png'}
                    alt={characterAvatar.title}
                  />
                </CardContent>
              </Card>
            )}
      </section>
      </>;

const renderDeviceSetupPage = () =><>
  <Typography variant="h1"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Device Setup</Typography>
  <UserSettings />
</>;

const renderLoginPage = () =><>
  <Typography variant="h1"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Login</Typography>
  <SignIn />
</>;

const config = getConfig().publicRuntimeConfig;
const renderAccountPage = () => <>
  <Typography variant="h1"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Account Settings</Typography>
  <section className={styles.subContainer}>
    <Typography variant="h2">Connected Accounts</Typography>
    {selfUser && selfUser.identityProviders && 
      selfUser.identityProviders.map(provider=>
        <Typography variant="h3">
          {renderProviderIcon(provider.type)}
          {provider.token}
        </Typography>)
      
    }
  </section>
  <section className={styles.subContainer}>
    <Typography variant="h2">Available Connections</Typography>
    <section className={styles.horizontalContainer}>
      {Object.entries(config.auth).map(([key, value]) => value && (<Typography variant="h2" align="center">{renderProviderIcon(key)}</Typography>))}
    </section>
  </section>
  <section className={styles.subContainer}>
    <Typography variant="h2">Account Options</Typography>
    <Typography variant="h4" align="left" onClick={handleLogout}><MeetingRoomIcon color="primary" /> Logout</Typography>
    <Typography variant="h4" align="left" onClick={handleAccountDeleteClick}><DeleteIcon color="primary" /> Delete account</Typography>
  </section>
</>;

const renderAccountDeletePage = () => <>
  <Typography variant="h1"><ArrowBackIosIcon onClick={()=>setDrawerType('default')} />Delete Account</Typography>
  <div>
    <Typography variant="h5" color="primary" className={styles.header}>Delete account?</Typography>
    <div className={styles.deleteAccountButtons}>
      <Button
          onClick={() => setDrawerType('account')}
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

const renderWorldInfoHorizontalItems = () => 
  <>
    <section className={styles.locationInfo} style={{ backgroundImage: `url(${currentScene?.thumbnailUrl})` }}>
      <span className={styles.sceneName}>{worldName}</span>
      <span className={styles.sceneLink}>{invitationLink}</span>
    </section>
    <section className={styles.horizontalContainer}>  
            {(!isMobileOrTablet() || !navigator.share) && <textarea readOnly className={styles.linkField} ref={refLink} value={invitationLink} />}
            <Typography variant="h2" align="center" onClick={() => isMobileOrTablet() && navigator.share ? handleMobileShareOnClick() : copyCodeToClipboard()}><LinkIcon color="primary" />Share</Typography>
            <Typography variant="h2" align="center" onClick={(event)=>handleTutorialClick(event)}><VideoLibraryIcon color="primary" />Tutorial</Typography>    
    </section>
  </>;


const renderProviderIcon = type =>{
  switch(type){
    case 'email': 
    case 'enableEmailMagicLink': 
        return <MailIcon />;
    case 'facebook': 
    case 'enableFacebookSocial': 
        return <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />;
    case 'github': 
    case 'enableGithubSocial': 
        return <GitHubIcon />;
    case 'google': 
    case 'enableGoogleSocial': 
        return <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />;
    case 'enableSmsMagicLink': return <SmsIcon />;
    case 'enableUserPassword': return <VpnKeyIcon />;
    case 'linkedin': return <LinkedInIcon width="40" height="40" viewBox="0 0 40 40"/>;
    case 'twitter': return <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />;
  }
};

const renderUserMenu = () =><>
          <section className={styles.userTitle}>
              <AccountCircleIcon color="primary" className={styles.userPreview} />
              <section className={styles.userTitleLine}>            
                <span className={styles.userTitle}>
                  {isEditUsername ? 
                      <TextField
                      variant="standard"
                      color="secondary"
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label='Username'
                      name="username"
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                      : selfUser?.name}
                  {isEditUsername ?
                       <CachedIcon color="secondary" onClick={handleUpdateUsername} /> :
                       <CreateIcon color="primary" onClick={handleShowEditUsername}/> }
                  </span>
                  <span className={styles.userTitleRole}>{ selfUser?.userRole}</span>
              </section>            
          </section> 
          {renderWorldInfoHorizontalItems()}
          <Button variant="outlined" color="secondary" onClick={handleAvatarChangeClick}>Change Avatar</Button>   
          <section className={styles.socialSection}>
            { selfUser?.userRole === 'guest' ? 
                <>
                  <Typography variant="h2" align="center">Connect An Social For Social Features</Typography>
                  <Button variant="outlined" color="primary" onClick={handleLogin}>Login</Button>
                  <Button variant="contained" color="primary">Create Account</Button>
                </> :
                <>
                  {selfUser && selfUser.identityProviders && 
                    <>
                    <Typography variant="h2" align="center">Public Social Accounts</Typography>
                      {selfUser.identityProviders.map(provider=>
                        <Typography variant="h3">
                          {renderProviderIcon(provider.type)}
                          {provider.token}
                        </Typography>)
                      }
                    </>}
                  <Button variant="outlined" color="primary" onClick={handleAccountSettings}>Account Settings</Button>
                </>}
          </section>
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
    case 'account': return renderAccountPage();
    case 'accountDelete': return renderAccountDeletePage();
    default: return renderUserMenu();
  }
};

  return (
        <section key={anchor} className={styles.anchorContainer}>
          <span className={styles.anchorDrawer} onClick={toggleDrawer(anchor, isOpenDrawer === true ? false : true)}  />
          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            className={styles.drawer}
            BackdropProps={{invisible:true, open:false }}
            {...(state[anchor] && { variant: "permanent"})}
          >
            {renderDrawerContent()}            
          </Drawer>
        </section>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
