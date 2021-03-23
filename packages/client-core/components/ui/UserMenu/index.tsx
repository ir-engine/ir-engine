import LinkIcon from '@material-ui/icons/Link';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAppOnBoardingStep } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import {
  updateUserAvatarId,
  updateUserSettings,
  uploadAvatarModel,
  fetchAvatarList,
  removeAvatar,
} from '../../../redux/auth/service';
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
import { ClientInputSystem } from '@xr3ngine/engine/src/input/systems/ClientInputSystem';

type StateType = {
  currentActiveMenu: any;
  profileMenuOpen: boolean;
  username: any;
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
  updateUserAvatarId: bindActionCreators(updateUserAvatarId, dispatch),
  updateUserSettings: bindActionCreators(updateUserSettings, dispatch),
  alertSuccess: bindActionCreators(alertSuccess, dispatch),
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  uploadAvatarModel: bindActionCreators(uploadAvatarModel, dispatch),
  fetchAvatarList: bindActionCreators(fetchAvatarList, dispatch),
  removeAvatar: bindActionCreators(removeAvatar, dispatch),
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
  avatarList = this.props.authState.get('avatarList') || [];
  prevPropUsername = '';

  constructor(props) {
    super(props);

    this.state = {
      currentActiveMenu: {} as any,
      profileMenuOpen: false,
      username: '',
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
    document.removeEventListener('ENGINE_LOADED', this.onEngineLoaded);
  }

  graphicsSettingsLoaded = () => {
    EngineEvents.instance?.addEventListener(WebGLRendererSystem.EVENTS.QUALITY_CHANGED, this.setGraphicsSettings);
    EngineEvents.instance?.removeEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, this.graphicsSettingsLoaded);
  }

  setUsername = (username) => {
    this.setState({ username })
  }

  setAvatar = (avatarId: string, avatarURL: string, thumbnailURL: string) => {
    if (this.selfUser) {
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
    const enabled = Boolean(this.state.currentActiveMenu && this.state.currentActiveMenu.id === identity[0])
    this.setState({
      currentActiveMenu: enabled ? null : this.menus[identity[1]]
    });
    // EngineEvents.instance.dispatchEvent({ type: ClientInputSystem.EVENTS.ENABLE_INPUT, mouse: enabled, keyboard: enabled })
  }

  changeActiveMenu = (menu) => {
    const enabled = Boolean(this.state.currentActiveMenu && this.state.currentActiveMenu.id === menu)
    this.setState({ currentActiveMenu: menu ? { id: menu } : null });
  }

  renderMenuPanel = () => {
    if (!this.state.currentActiveMenu) return null;

    let args = {};
    switch (this.state.currentActiveMenu.id) {
      case Views.Profile:
        args = {
          changeActiveMenu: this.changeActiveMenu,
        };
        break;
      case Views.Avatar:
        args = {
          setAvatar: this.setAvatar,
          changeActiveMenu: this.changeActiveMenu,
          removeAvatar: this.props.removeAvatar,
          fetchAvatarList: this.props.fetchAvatarList,
          avatarList: this.avatarList,
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
