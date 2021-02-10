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
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { endVideoChat, leave } from "@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions";
import { loadActorAvatar } from '@xr3ngine/engine/src/templates/character/behaviors/loadActorAvatar';
import { setActorAvatar } from "@xr3ngine/engine/src/templates/character/behaviors/setActorAvatar";
import getConfig from 'next/config';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { logoutUser, removeUser, updateUserAvatarId, updateUsername } from '../../../redux/auth/service';
import { showDialog } from '../../../redux/dialog/service';
import { selectInstanceConnectionState } from "../../../redux/instanceConnection/selector";
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
    instanceConnectionState: selectInstanceConnectionState(state),
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
  const [drawerType, setDrawerType] = useState(Views.Closed);

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

  const handleAccountDeleteClick = () => setDrawerType(Views.DeleteAccount);
  const handleAvatarChangeClick = () => setDrawerType(Views.Avatar);
  const handleDeviceSetupClick = () => setDrawerType(Views.Settings);
  const handleAccountSettings = () => setDrawerType(Views.Account);
  const handleLogin = () => setDrawerType(Views.Login);
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
    setDrawerType(Views.Closed);
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

  const handleLogout = async () => {
    if (currentLocation != null && currentLocation.slugifiedName != null) {
      await endVideoChat({ endConsumers: true });
      await leave();
      setWaitingForLogout(true);
    }
    logoutUser();
    setDrawerType(Views.Closed);
  };

  const handleCloseSnackBar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackBar(false);
  };

  const handleUpdateUsername = () => {
    if (selfUser.name.trim() !== username.trim()) {
      updateUsername(selfUser.id, username);
    }
    setIsEditUsername(false);
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
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setDrawerType(Views.Closed)} />Device Setup</Typography>
    <UserSettings />
  </>;

  const renderLoginPage = () => <>
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setDrawerType(Views.Closed)} />Login</Typography>
    <SignIn />
  </>;

  const config = getConfig().publicRuntimeConfig;
  const renderAccountPage = () => <>
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setDrawerType(Views.Closed)} />Account Settings</Typography>
    <section className={styles.subContainer}>
      <Typography variant="h2">Connected Accounts</Typography>
      {selfUser && selfUser.identityProviders &&
        selfUser.identityProviders.map(provider =>
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


  const renderSharePage = () => <>

  </>;

  const renderAccountDeletePage = () => <>
    <Typography variant="h1"><ArrowBackIosIcon onClick={() => setDrawerType(Views.Closed)} />Delete Account</Typography>
    <div>
      <Typography variant="h5" color="primary" className={styles.header}>Delete account?</Typography>
      <div className={styles.deleteAccountButtons}>
        <Button
          onClick={() => setDrawerType(Views.Account)}
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
      </section>
    </>;


  const renderProviderIcon = type => {
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

  const setAvatar = (avatarId: string) => {
    setActorAvatar(actorEntity, { avatarId });
    loadActorAvatar(actorEntity);
    updateUserAvatarId(selfUser.id, avatarId);
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
          user: selfUser,
          setUsername: (e) => {
            setUsername(e.target.value);
          },
          openAvatarMenu,
        };
        break;
      case Views.Avatar:
        args = { setAvatar };
        break;
      case Views.Settings: return renderDeviceSetupPage();
      case Views.Login: return renderLoginPage();
      case Views.Account: return renderAccountPage();
      case Views.DeleteAccount: return renderAccountDeletePage();
      case Views.Share: return renderSharePage();
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

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
