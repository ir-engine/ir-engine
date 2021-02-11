import { Button, Snackbar, Typography } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkIcon from '@material-ui/icons/Link';
import MailIcon from '@material-ui/icons/Mail';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import SmsIcon from '@material-ui/icons/Sms';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { endVideoChat, leave } from "@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions";
// import { setActorAvatar } from "@xr3ngine/engine/src/templates/character/behaviors/setActorAvatar";
// import { loadActorAvatar } from '@xr3ngine/engine/src/templates/character/behaviors/loadActorAvatar';
// import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import { CharacterComponent } from '@xr3ngine/engine/src/templates/character/components/CharacterComponent';
import getConfig from 'next/config';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { logoutUser, removeUser, updateUserAvatarId, updateUsername } from '../../../redux/auth/service';
import { showDialog } from '../../../redux/dialog/service';
import { provisionInstanceServer } from "../../../redux/instanceConnection/service";
import { selectLocationState } from '../../../redux/location/selector';
import { selectCurrentScene } from '../../../redux/scenes/selector';
import SignIn from '../Auth/Login';
import { FacebookIcon } from '../Icons/FacebookIcon';
import { GoogleIcon } from '../Icons/GoogleIcon';
import { LinkedInIcon } from '../Icons/LinkedInIcon';
import { TwitterIcon } from '../Icons/TwitterIcon';
import UserSettings from '../Profile/UserSettings';
import { Views, UserMenuProps } from './util';
import styles from './style.module.scss';
import ProfileMenu from './SettingMenu/ProfileMenu';
import AvatarMenu from './SettingMenu/AvatarMenu';

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    authState: selectAuthState(state),
    locationState: selectLocationState(state),
    currentScene: selectCurrentScene(state),
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

const UserMenu = (props: UserMenuProps): any => {
  const {
    authState,
    locationState,
    logoutUser,
    removeUser,
    updateUsername,
    updateUserAvatarId,
    currentScene
  } = props;
  const selfUser = authState.get('user');
  const currentLocation = locationState.get('currentLocation').get('location');

  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isEditUsername, setIsEditUsername] = useState(false);
  const [username, setUsername] = useState(selfUser?.name);
  const [currentView, setCurrentView] = useState(Views.Closed);

  const invitationLink = window.location.href;
  const refLink = useRef(null);
  const postTitle = 'AR/VR world';
  const siteTitle = 'XR3ngine';
  const worldName = 'Loading...';

  const handleAccountDeleteClick = () => setCurrentView(Views.DeleteAccount);
  const handleAvatarChangeClick = () => setCurrentView(Views.Avatar);
  const handleDeviceSetupClick = () => setCurrentView(Views.Settings);
  const handleAccountSettings = () => setCurrentView(Views.Account);
  const handleLogin = () => setCurrentView(Views.Login);
  const handleShowEditUsername = () => setIsEditUsername(!isEditUsername);

  const [waitingForLogout, setWaitingForLogout] = useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [currentActiveMenu, setCurrentActiveMenu] = useState({} as any);
  const [actorEntity, setActorEntity] = useState(null);
  const [actorAvatarId, setActorAvatarId] = useState(selfUser?.avatarId);

  const copyCodeToClipboard = () => {
    refLink.current.select();
    document.execCommand("copy");
    setOpenSnackBar(true);
  };

  const confirmAccountDelete = () => {
    removeUser(selfUser.id);
    setCurrentView(Views.Closed);
  };

  const handleMobileShareOnClick = () => {
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

  const handleLogout = async () => {
    if (currentLocation != null && currentLocation.slugifiedName != null) {
      await endVideoChat({ endConsumers: true });
      await leave();
      setWaitingForLogout(true);
    }
    logoutUser();
    setCurrentView(Views.Closed);
  };

  const handleCloseSnackBar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackBar(false);
  };

  const renderSuccessMessage = () =>
    <Snackbar open={openSnackBar}
      autoHideDuration={3000}
      onClose={handleCloseSnackBar}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}>
      <section>Link successfully added to clipboard</section>
    </Snackbar>;

  useEffect(() => {
    const actorEntityWaitInterval = setInterval(() => {
      if (Network.instance?.localClientEntity) {
        setActorEntity(Network.instance.localClientEntity);
        clearInterval(actorEntityWaitInterval);
      }
    }, 300);
  }, []);

  useEffect(() => {
    selfUser && setUsername(selfUser.name);
  }, [selfUser]);

  useEffect(() => {
    if (waitingForLogout === true && authState.get('authUser') != null && authState.get('user') != null && authState.get('user').userRole === 'guest') {
      setWaitingForLogout(false);
      location.reload();
    }
  }, [authState]);

  const renderDeviceSetupPage = () => <>
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setCurrentView(Views.Closed)} />Device Setup</Typography>
    <UserSettings />
  </>;

  const LoginPage = () => <>
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setCurrentView(Views.Closed)} />Login</Typography>
    <SignIn />
  </>;

  const config = getConfig().publicRuntimeConfig;
  const AccountPage = () => <>
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setCurrentView(Views.Closed)} />Account Settings</Typography>
    <section className={styles.subContainer}>
      <Typography variant="h2">Connected Accounts</Typography>
      {selfUser && selfUser.identityProviders &&
        selfUser.identityProviders.map(provider =>
          <Typography variant="h3">
            {SSOProviderIcons(provider.type)}
            {provider.token}
          </Typography>)

      }
    </section>
    <section className={styles.subContainer}>
      <Typography variant="h2">Available Connections</Typography>
      <section className={styles.horizontalContainer}>
        {Object.entries(config.auth).map(([key, value]) => value && (<Typography variant="h2" align="center">{SSOProviderIcons(key)}</Typography>))}
      </section>
    </section>
    <section className={styles.subContainer}>
      <Typography variant="h2">Account Options</Typography>
      <Typography variant="h4" align="left" onClick={handleLogout}><MeetingRoomIcon color="primary" /> Logout</Typography>
      <Typography variant="h4" align="left" onClick={handleAccountDeleteClick}><DeleteIcon color="primary" /> Delete account</Typography>
    </section>
  </>;

  const SharePage = () => <>

  </>;

  const AccountDeletePage = () => <>
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setCurrentView(Views.Closed)} />Delete Account</Typography>
    <div>
      <Typography variant="h5" color="primary" className={styles.header}>Delete account?</Typography>
      <div className={styles.deleteAccountButtons}>
        <Button
          onClick={() => setCurrentView(Views.Account)}
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

  const SSOProviderIcons = type => {
    switch (type) {
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
      case 'linkedin': return <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />;
      case 'twitter': return <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />;
    }
  };

  const menus = [
    { id: Views.Profile, iconNode: PersonIcon },
    { id: Views.Settings, iconNode: SettingsIcon },
    { id: Views.Share, iconNode: LinkIcon },
  ];

  const menuPanel = {
    [Views.Profile]: ProfileMenu,
    [Views.Settings]: null,
    [Views.Share]: null,
    [Views.Avatar]: AvatarMenu,
  };

  const handleUpdateUsername = () => {
    if (selfUser.name.trim() !== username.trim()) {
      updateUsername(selfUser.id, username.trim());
    }
  };

  const setAvatar = (avatarId: string) => {
    if (actorEntity && actorAvatarId) {
      const characterAvatar = getMutableComponent(actorEntity, CharacterComponent);
      if (characterAvatar != null) characterAvatar.avatarId = actorAvatarId;
      // We can pull this from NetworkPlayerCharacter, but we probably don't want our state update here
      // loadActorAvatar(actorEntity);
      updateUserAvatarId(selfUser.id, actorAvatarId);
    }

    // setActorAvatar(actorEntity, { avatarId });
    // loadActorAvatar(actorEntity);
    // updateUserAvatarId(selfUser.id, avatarId);
  }

  const setActiveMenu = (e): void => {
    const identity = e.currentTarget.id.split('_');
    setCurrentActiveMenu(
      currentActiveMenu && currentActiveMenu.id === identity[0]
        ? null
        : menus[identity[1]]
    );
  }

  const openAvatarMenu = () => {
    setCurrentActiveMenu({ id: Views.Avatar });
  }

  const renderMenuPanel = () => {
    if (!currentActiveMenu) return null;

    let args = {};
    switch (currentActiveMenu.id) {
      case Views.Profile: 
        args = {
          username,
          userRole: selfUser.userRole,
          avatarId: selfUser.avatarId,
          setUsername,
          updateUsername: handleUpdateUsername,
          openAvatarMenu,
        };
        break;
      case Views.Avatar:
        args = { setAvatar };
        break;
      case Views.Settings: return renderDeviceSetupPage();
      // case Views.Login: return renderLoginPage();
      // case Views.Account: return renderAccountPage();
      // case Views.DeleteAccount: return renderAccountDeletePage();
      // case Views.Share: return renderSharePage();
      default: return null;
    }

    const Panel = menuPanel[currentActiveMenu.id];

    return <Panel {...args} />
  };

  return (
    <>
      <section className={styles.settingContainer}>
        <div className={styles.iconContainer}>
          {menus.map((menu, index) => {
            return (
              <span
                key={index}
                id={menu.id + '_' + index}
                onClick={setActiveMenu}
                className={`${styles.materialIconBlock} ${currentActiveMenu && currentActiveMenu.id === menu.id ? styles.activeMenu : null}`}
              >
                <menu.iconNode className={styles.icon} />
              </span>
            )
          })}
        </div>
        {currentActiveMenu
          ? renderMenuPanel()
          : null}
      </section>
    </>
  );
};

// const UserProfilePage = () => <>
// <section className={styles.userTitle}>
//   <AccountCircleIcon color="primary" className={styles.userPreview} />
//   <section className={styles.userTitleLine}>
//     <span className={styles.userTitle}>
//       {isEditUsername ?
//         <TextField
//           variant="standard"
//           color="secondary"
//           margin="normal"
//           required
//           fullWidth
//           id="username"
//           label='Username'
//           name="username"
//           autoFocus
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         : selfUser?.name}
//       {isEditUsername ?
//         <CachedIcon color="secondary" onClick={handleUpdateUsername} /> :
//         <CreateIcon color="primary" onClick={handleShowEditUsername} />}
//     </span>
//     <span className={styles.userTitleRole}>{selfUser?.userRole}</span>
//   </section>
// </section>
// <section className={styles.locationInfo} style={{ backgroundImage: `url(${currentScene?.thumbnailUrl})` }}>
//     <span className={styles.sceneName}>{worldName}</span>
//     <span className={styles.sceneLink}>{invitationLink}</span>
//   </section>
//   <section className={styles.horizontalContainer}>
//     {(!isMobileOrTablet() || !navigator.share) && <textarea readOnly className={styles.linkField} ref={refLink} value={invitationLink} />}
//     <Typography variant="h2" align="center" onClick={() => isMobileOrTablet() && navigator.share ? handleMobileShareOnClick() : copyCodeToClipboard()}><LinkIcon color="primary" />Share</Typography>
//   </section>
// <Button variant="outlined" color="secondary" onClick={handleAvatarChangeClick}>Change Avatar</Button>
// <section className={styles.socialSection}>
//   {selfUser?.userRole === 'guest' ?
//     <>
//       <Typography variant="h2" align="center">Connect An Social For Social Features</Typography>
//       <Button variant="outlined" color="primary" onClick={handleLogin}>Login</Button>
//       <Button variant="contained" color="primary">Create Account</Button>
//     </> :
//     <>
//       {selfUser && selfUser.identityProviders &&
//         <>
//           <Typography variant="h2" align="center">Public Social Accounts</Typography>
//           {selfUser.identityProviders.map(provider =>
//             <Typography variant="h3">
//               {SSOProviderIcons(provider.type)}
//               {provider.token}
//             </Typography>)
//           }
//         </>}
//       <Button variant="outlined" color="primary" onClick={handleAccountSettings}>Account Settings</Button>
//     </>}
// </section>
// <section className={styles.placeholder} />
// <Typography variant="h2" align="left" onClick={handleDeviceSetupClick}><SettingsIcon color="primary" /> Settings</Typography>
// <Typography variant="h2" align="left"><ToysIcon color="primary" /> About</Typography>
// <Typography variant="h2" align="left"><PolicyIcon color="primary" /> Privacy & Terms</Typography>
// <Snackbar open={openSnackBar}
//   autoHideDuration={3000}
//   onClose={handleCloseSnackBar}
//   anchorOrigin={{
//     vertical: 'top',
//     horizontal: 'center',
//   }}>
//   <section>Link successfully added to clipboard</section>
// </Snackbar>;
// </>;
// return (
// <>
//   <section className={styles.anchorContainer}>
//     { currentView === Views.Profile && <UserProfilePage /> }
//     { currentView === Views.DeleteAccount && <AccountDeletePage /> }
//     { currentView === Views.Share && <SharePage /> }
//     { currentView === Views.Login && <AccountPage /> }
//     { currentView === Views.Account && <LoginPage /> }
//     { currentView === Views.Settings && <SettingsPage /> }
//     { currentView === Views.Avatar && <AvatarSelectionPage /> }
//     </section>
// </>
// );
// };

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
