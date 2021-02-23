import LinkIcon from '@material-ui/icons/Link';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';

import { getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { endVideoChat, leave } from "@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions";
import { loadActorAvatar } from '@xr3ngine/engine/src/templates/character/prefabs/NetworkPlayerCharacter';
import { CharacterComponent } from '@xr3ngine/engine/src/templates/character/components/CharacterComponent';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { logoutUser, removeUser, updateUserAvatarId, updateUsername, updateUserSettings, updateGraphicsSettings } from '../../../redux/auth/service';
import { addConnectionByEmail, addConnectionBySms, loginUserByOAuth } from '../../../redux/auth/service';
import { alertSuccess } from '../../../redux/alert/service';
import { provisionInstanceServer } from "../../../redux/instanceConnection/service";
import { selectLocationState } from '../../../redux/location/selector';
import { selectCurrentScene } from '../../../redux/scenes/selector';
import { Views, UserMenuProps } from './util';
import styles from './style.module.scss';
import ProfileMenu from './menus/ProfileMenu';
import AvatarMenu from './menus/AvatarMenu';
import SettingMenu from './menus/SettingMenu';
import ShareMenu from './menus/ShareMenu';
import { WebGLRendererSystem } from '@xr3ngine/engine/src/renderer/WebGLRendererSystem';

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state),
    authState: selectAuthState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateUsername: bindActionCreators(updateUsername, dispatch),
  updateUserAvatarId: bindActionCreators(updateUserAvatarId, dispatch),
  updateUserSettings: bindActionCreators(updateUserSettings, dispatch),
  updateGraphicsSettings: bindActionCreators(updateGraphicsSettings, dispatch),
  alertSuccess: bindActionCreators(alertSuccess, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  loginUserByOAuth: bindActionCreators(loginUserByOAuth, dispatch),
  addConnectionBySms: bindActionCreators(addConnectionBySms, dispatch),
  addConnectionByEmail: bindActionCreators(addConnectionByEmail, dispatch),
  logoutUser: bindActionCreators(addConnectionByEmail, dispatch),
  removeUser: bindActionCreators(addConnectionByEmail, dispatch),
});

const UserMenu = (props: UserMenuProps): any => {
  const {
    authState,
    updateUsername,
    updateUserAvatarId,
    alertSuccess,
    addConnectionByEmail,
    addConnectionBySms,
    loginUserByOAuth,
    logoutUser,
    removeUser,
  } = props;
  const selfUser = authState.get('user') || {};

  const [username, setUsername] = useState(selfUser?.name);
  const [setting, setUserSetting] = useState(selfUser?.user_setting);
  const [graphics, setGraphicsSetting] = useState({
    resolution: WebGLRendererSystem.scaleFactor,
    shadows: WebGLRendererSystem.shadowQuality,
    automatic: WebGLRendererSystem.automatic,
    pbr: WebGLRendererSystem.usePBR,
    postProcessing: WebGLRendererSystem.usePostProcessing,
  });


  const [waitingForLogout, setWaitingForLogout] = useState(false);
  const [currentActiveMenu, setCurrentActiveMenu] = useState({} as any);
  const [actorEntity, setActorEntity] = useState(null);

  useEffect(() => {
    let actorEntityWaitInterval;
    if (selfUser.id && !actorEntity) {
      actorEntityWaitInterval = setInterval(() => {
        const entity = Network.instance?.localClientEntity;
        if (Network.instance?.localClientEntity) {
          clearInterval(actorEntityWaitInterval);
          setActorEntity(entity);
          updateCharacterComponent(entity, selfUser?.avatarId);
        }
      }, 300);
    } else {
      clearInterval(actorEntityWaitInterval);
    }
  }, [selfUser.id]);

  useEffect(() => {
    selfUser && setUsername(selfUser.name);
  }, [selfUser.name]);

  useEffect(() => {
    selfUser && setUserSetting({ ...selfUser.user_setting });
  }, [selfUser.user_setting]);

  // useEffect(() => {
  //   setGraphicsSetting({ ...graphics });
  // }, [graphics]);

  const updateGraphics = (newGraphicsSettings) => {
    console.log(newGraphicsSettings);
  }

  useEffect(() => {
    WebGLRendererSystem.qualityLevelChangeListeners.push(updateGraphics);
    return function cleanup() {
      WebGLRendererSystem.qualityLevelChangeListeners.splice(WebGLRendererSystem.qualityLevelChangeListeners.indexOf(updateGraphics), 1);
    };
  }, [])

  useEffect(() => {
    if (waitingForLogout === true && authState.get('authUser') != null && authState.get('user') != null && authState.get('user').userRole === 'guest') {
      setWaitingForLogout(false);
      location.reload();
    }
  }, [authState]);

  const menus = [
    { id: Views.Profile, iconNode: PersonIcon },
    { id: Views.Settings, iconNode: SettingsIcon },
    { id: Views.Share, iconNode: LinkIcon },
  ];

  const menuPanel = {
    [Views.Profile]: ProfileMenu,
    [Views.Settings]: SettingMenu,
    [Views.Share]: ShareMenu,
    [Views.Avatar]: AvatarMenu,
  };

  const handleUpdateUsername = () => {
    const name = username.trim();
    if (!name) return;
    if (selfUser.name.trim() !== name) {
      updateUsername(selfUser.id, name);
    }
  };


  const updateCharacterComponent = (entity, avatarId?: string) => {
    const characterAvatar = getMutableComponent(entity, CharacterComponent);
    if (characterAvatar != null) characterAvatar.avatarId = avatarId || selfUser?.avatarId;

    // We can pull this from NetworkPlayerCharacter, but we probably don't want our state update here
    loadActorAvatar(entity);
  }

  const setAvatar = (avatarId: string) => {
    if (actorEntity && avatarId) {
      updateCharacterComponent(actorEntity, avatarId);
      updateUserAvatarId(selfUser.id, avatarId);
    }
  }

  const setUserSettings = (newSetting: any): void => {
    setUserSetting({ ...setting, ...newSetting });
    updateUserSettings(selfUser.user_setting.id, setting);
  }

  const setGraphicsSettings = (newSetting: any): void => {
    setGraphicsSetting({ ...graphics, ...newSetting });
    updateGraphicsSettings(graphics);
  }

  const setActiveMenu = (e): void => {
    const identity = e.currentTarget.id.split('_');
    setCurrentActiveMenu(
      currentActiveMenu && currentActiveMenu.id === identity[0]
        ? null
        : menus[identity[1]]
    );
  }

  const changeActiveMenu = (menu) => {
    setCurrentActiveMenu(menu ? { id: menu } : null);
  }

  const renderMenuPanel = () => {
    if (!currentActiveMenu) return null;

    let args = {};
    switch (currentActiveMenu.id) {
      case Views.Profile: 
        args = {
          username,
          userRole: selfUser?.userRole,
          avatarId: selfUser?.avatarId,
          setUsername,
          updateUsername: handleUpdateUsername,
          changeActiveMenu,
          logoutUser,
          removeUser,
          loginUserByOAuth,
          addConnectionByEmail,
          addConnectionBySms,
        };
        break;
      case Views.Avatar:
        args = {
          setAvatar,
          changeActiveMenu,
          avatarId: selfUser?.avatarId,
        };
        break;
      case Views.Settings:
        args = {
          setting,
          setUserSettings,
          graphics,
          setGraphicsSettings,
        };
        break;
      case Views.Share:
        args = { alertSuccess };
        break;
      case Views.Account: 
        args = {
          userId: selfUser?.id,
          changeActiveMenu,
          loginUserByOAuth,
          addConnectionByEmail,
          addConnectionBySms,
        };
        break;
      // case Views.Login: return renderLoginPage();
      // case Views.DeleteAccount: return renderAccountDeletePage();
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
