import LinkIcon from '@material-ui/icons/Link';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { logoutUser, removeUser, updateUserAvatarId, updateUsername, updateUserSettings, addConnectionByEmail, addConnectionBySms, loginUserByOAuth, uploadAvatarModel, fetchAvatarList } from '../../../redux/auth/service';
import { alertSuccess } from '../../../redux/alert/service';
import { provisionInstanceServer } from "../../../redux/instanceConnection/service";
import { Views, UserMenuProps } from './util';
//@ts-ignore
import styles from './style.module.scss';
import ProfileMenu from './menus/ProfileMenu';
import AvatarMenu from './menus/AvatarMenu';
import SettingMenu from './menus/SettingMenu';
import ShareMenu from './menus/ShareMenu';
import AvatarSelectMenu from './menus/AvatarSelectMenu';
import { WebGLRendererSystem } from '@xr3ngine/engine/src/renderer/WebGLRendererSystem';
import { EngineEvents } from '@xr3ngine/engine/src/ecs/classes/EngineEvents';

type StateType = {
  currentActiveMenu: any;
  username: any;
  actorEntityID: string | number;
  userSetting: any;
  graphics: any;
}

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
  loginUserByOAuth: bindActionCreators(loginUserByOAuth, dispatch),
  addConnectionBySms: bindActionCreators(addConnectionBySms, dispatch),
  addConnectionByEmail: bindActionCreators(addConnectionByEmail, dispatch),
  logoutUser: bindActionCreators(logoutUser, dispatch),
  removeUser: bindActionCreators(removeUser, dispatch),
  uploadAvatarModel: bindActionCreators(uploadAvatarModel, dispatch),
  fetchAvatarList: bindActionCreators(fetchAvatarList, dispatch),
});

class UserMenu extends React.Component<UserMenuProps, StateType> {
  menus = [
    { id: Views.Profile, iconNode: PersonIcon },
    { id: Views.Settings, iconNode: SettingsIcon },
    { id: Views.Share, iconNode: LinkIcon },
  ];

  menuPanel = {
    [Views.Profile]: ProfileMenu,
    [Views.Settings]: SettingMenu,
    [Views.Share]: ShareMenu,
    [Views.Avatar]: AvatarMenu,
    [Views.AvatarUpload]: AvatarSelectMenu,
  };

  selfUser = this.props.authState.get('user') || {};
  activeAvatar = this.props.authState.get('activeAvatar') || {};
  avatarList = this.props.authState.get('avatarList') || [];
  prevPropUsername = '';

  constructor(props) {
    super(props);

    this.state = {
      currentActiveMenu: {} as any,
      username: '',
      actorEntityID: 0,
      userSetting: {},
      graphics: {
        resolution: WebGLRendererSystem.scaleFactor,
        shadows: WebGLRendererSystem.shadowQuality,
        automatic: WebGLRendererSystem.automatic,
        pbr: WebGLRendererSystem.usePBR,
        postProcessing: WebGLRendererSystem.usePostProcessing,
      }
    }

    document.addEventListener('ENGINE_LOADED', this.onEngineLoaded);
  }

  static getDerivedStateFromProps(props, state) {
    const sf = props.authState.get('user');
    if (!sf) return null;

    if (state.prevPropUsername !== sf.name ) {
      return { username: sf.name, prevPropUsername: sf.name };
    } else if (sf.user_setting !== state.userSetting) {
      return {
        userSetting: sf.user_setting
      }
    }
    // else if (state.waitingForLogout === true && 
    //   props.authState.get('authUser') != null && 
    //   props.authState.get('user') != null && 
    //   props.authState.get('user').userRole === 'guest') {
    //   setWaitingForLogout(false);
    //   location.reload();
    // }

    return null;
  }

  componentWillUnmount() {
    EngineEvents.instance?.removeEventListener(WebGLRendererSystem.EVENTS.QUALITY_CHANGED, this.setGraphicsSettings);
  }

  onEngineLoaded = () => {
    EngineEvents.instance?.addEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, this.graphicsSettingsLoaded);
    EngineEvents.instance?.addEventListener(EngineEvents.EVENTS.CLIENT_ENTITY_LOAD, this.clientEntityLoaded);
    document.removeEventListener('ENGINE_LOADED', this.onEngineLoaded);
  }

  graphicsSettingsLoaded = () => {
    EngineEvents.instance?.addEventListener(WebGLRendererSystem.EVENTS.QUALITY_CHANGED, this.setGraphicsSettings);
    EngineEvents.instance?.removeEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, this.graphicsSettingsLoaded);
  }

  clientEntityLoaded = (ev: any) => {
    const id = ev.id;
    Network.instance.localClientEntity = id;
    this.setState({ actorEntityID: id });
    this.updateCharacterComponent(id, this.selfUser?.avatarId, this.activeAvatar?.avatar?.url);
    EngineEvents.instance?.removeEventListener(EngineEvents.EVENTS.CLIENT_ENTITY_LOAD, this.clientEntityLoaded);
  }

  setUsername = (username) => {
    this.setState({ username })
  }

  handleUpdateUsername = () => {
    const name = this.state.username.trim();
    if (!name) return;
    if (this.selfUser.name.trim() !== name) {
      this.props.updateUsername(this.selfUser.id, name);
    }
  };

  updateCharacterComponent = (entityID, avatarId?: string, avatarURL?: string) => {
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.LOAD_AVATAR, entityID, avatarId: avatarId || this.selfUser?.avatarId, avatarURL });
  }

  setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (this.state.actorEntityID) {
      this.updateCharacterComponent(this.state.actorEntityID, avatarId, avatarURL);
      this.props.updateUserAvatarId(this.selfUser.id, avatarId, avatarURL, thumbnailURL);
    }
  }

  setUserSettings = (newSetting: any): void => {
    const setting = { ...this.state.userSetting, ...newSetting };

    this.setState({ userSetting: setting });
    this.props.updateUserSettings(this.selfUser.user_setting.id, setting);
  }

  setGraphicsSettings = (newSetting: any): void => {
    const setting = { ...this.state.graphics, ...newSetting };

    this.setState({ graphics: setting });
  }

  setActiveMenu = (e): void => {
    const identity = e.currentTarget.id.split('_');
    this.setState({ 
      currentActiveMenu: this.state.currentActiveMenu && this.state.currentActiveMenu.id === identity[0]
          ? null
          : this.menus[identity[1]]
    });
  }

  changeActiveMenu = (menu) => {
    this.setState({ currentActiveMenu: menu ? { id: menu } : null });
  }

  renderMenuPanel = () => {
    if (!this.state.currentActiveMenu) return null;

    let args = {};
    switch (this.state.currentActiveMenu.id) {
      case Views.Profile:
        args = {
          username: this.state.username,
          userRole: this.selfUser?.userRole,
          userId: this.selfUser?.id,
          activeAvatar: this.activeAvatar,
          setUsername: this.setUsername,
          updateUsername: this.handleUpdateUsername,
          changeActiveMenu: this.changeActiveMenu,
          logoutUser: this.props.logoutUser,
          removeUser: this.props.removeUser,
          loginUserByOAuth: this.props.loginUserByOAuth,
          addConnectionByEmail: this.props.addConnectionByEmail,
          addConnectionBySms: this.props.addConnectionBySms,
          Network,
        };
        break;
      case Views.Avatar:
        args = {
          setAvatar: this.setAvatar,
          changeActiveMenu: this.changeActiveMenu,
          fetchAvatarList: this.props.fetchAvatarList,
          avatarList: this.avatarList,
          activeAvatar: this.activeAvatar,
          avatarId: this.selfUser?.avatarId,
        };
        break;
      case Views.Settings:
        args = {
          setting: this.state.userSetting,
          setUserSettings: this.setUserSettings,
          graphics: this.state.graphics,
          setGraphicsSettings: this.setGraphicsSettings,
        };
        break;
      case Views.Share:
        args = { alertSuccess: this.props.alertSuccess };
        break;
      case Views.AvatarUpload:
        args = {
          userId: this.selfUser?.id,
          changeActiveMenu: this.changeActiveMenu,
          uploadAvatarModel: this.props.uploadAvatarModel,
        };
        break;
      default: return null;
    }

    const Panel = this.menuPanel[this.state.currentActiveMenu.id];

    return <Panel {...args} />
  };

  render () {
    this.selfUser = this.props.authState.get('user') || {};
    this.activeAvatar = this.props.authState.get('activeAvatar') || {};
    this.avatarList = this.props.authState.get('avatarList') || [];
    return (
      <ClickAwayListener onClickAway={() => this.setState({ currentActiveMenu: null })}>
        <section className={styles.settingContainer}>
          <div className={styles.iconContainer}>
            {this.menus.map((menu, index) => {
              return (
                <span
                  key={index}
                  id={menu.id + '_' + index}
                  onClick={this.setActiveMenu}
                  className={`${styles.materialIconBlock} ${this.state.currentActiveMenu && this.state.currentActiveMenu.id === menu.id ? styles.activeMenu : null}`}
                >
                  <menu.iconNode className={styles.icon} />
                </span>
              )
            })}
          </div>
          {this.state.currentActiveMenu
            ? this.renderMenuPanel()
            : null}
        </section>
      </ClickAwayListener>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);
