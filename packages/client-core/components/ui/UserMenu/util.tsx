export const Views = {
  Closed: '',
  Profile: 'Profile',
  Settings: 'Settings',
  Share: 'Share',
  DeleteAccount: 'accountDelete',
  Login: 'login',
  Account: 'account',
  Avatar: 'Avatar',
}

export interface UserMenuProps {
  login?: boolean;
  authState?: any;
  instanceConnectionState?: any;
  locationState?: any;
  updateUsername?: Function;
  updateUserAvatarId?: Function;
  logoutUser?: Function;
  showDialog?: Function;
  removeUser?: Function;
  currentScene?: any;
  provisionInstanceServer?: any;
}

export interface SettingMenuProps {
  activeMenu: any;
  setActiveMenu?: Function;
}

export const getAvatarURL = (avatarId: string): string => `/static/${avatarId.toLocaleLowerCase()}.png`