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
import { logoutUser, removeUser, updateUserAvatarId, updateUsername, updateUserSettings } from '../../../redux/auth/service';
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
import AccountMenu from './menus/AccountMenu';

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
  alertSuccess: bindActionCreators(alertSuccess, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
});

const UserMenu = (props: UserMenuProps): any => {
  const {
    authState,
    updateUsername,
    updateUserAvatarId,
    alertSuccess,
  } = props;
  const selfUser = authState.get('user') || {};

  const [username, setUsername] = useState(selfUser?.name);
  const [setting, setUserSetting] = useState(selfUser?.user_setting);


  const [waitingForLogout, setWaitingForLogout] = useState(false);
  const [currentActiveMenu, setCurrentActiveMenu] = useState({} as any);
  const [actorEntity, setActorEntity] = useState(null);

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
  }, [selfUser.name]);

  useEffect(() => {
    selfUser && setUserSetting({ ...selfUser.user_setting });
  }, [selfUser.user_setting]);

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
    [Views.Account]: AccountMenu,
  };

  const handleUpdateUsername = () => {
    if (selfUser.name.trim() !== username.trim()) {
      updateUsername(selfUser.id, username.trim());
    }
  };

  const setAvatar = (avatarId: string) => {
    if (actorEntity && avatarId) {
      const characterAvatar = getMutableComponent(actorEntity, CharacterComponent);
      if (characterAvatar != null) characterAvatar.avatarId = avatarId;

      // We can pull this from NetworkPlayerCharacter, but we probably don't want our state update here
      loadActorAvatar(actorEntity);
      updateUserAvatarId(selfUser.id, avatarId);
    }
  }

  const setUserSettings = (newSetting: any): void => {
    setUserSetting({ ...setting, ...newSetting });
    updateUserSettings(selfUser.user_setting.id, setting);
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

  const openAccountMenu = () => {
    setCurrentActiveMenu({ id: Views.Account });
  }

  const closeMenu = () => {
    setCurrentActiveMenu(null);
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
          openAvatarMenu,
          openAccountMenu,
        };
        break;
      case Views.Avatar:
        args = {
          setAvatar,
          closeMenu,
          avatarId: selfUser?.avatarId,
        };
        break;
      case Views.Settings:
        args = {
          setting,
          setUserSettings,
        };
        break;
      case Views.Share:
        args = { alertSuccess };
        break;
      case Views.Account: 
        args = { closeMenu };
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
