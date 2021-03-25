export const Views = {
  Closed: '',
  Profile: 'Profile',
  Settings: 'Settings',
  Share: 'Share',
  DeleteAccount: 'accountDelete',
  Login: 'login',
  AvatarUpload: 'AvatarUpload',
  Avatar: 'Avatar',
}

export interface UserMenuProps {
  login?: boolean;
  authState?: any;
  instanceConnectionState?: any;
  locationState?: any;
  updateUserAvatarId?: Function;
  showDialog?: Function;
  alertSuccess?: Function;
  currentScene?: any;
  provisionInstanceServer?: any;
  uploadAvatarModel?: Function;
  fetchAvatarList?: Function;
  updateUserSettings?: Function;
  removeAvatar?: Function;
}

export interface SettingMenuProps {
  activeMenu: any;
  setActiveMenu?: Function;
}

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = '/placeholders/default-silhouette.svg';

export const getAvatarURLFromNetwork = (network, userId) => {
  if (!network || !userId) return DEFAULT_PROFILE_IMG_PLACEHOLDER;
  if (!network.clients[userId]) return DEFAULT_PROFILE_IMG_PLACEHOLDER;
  return network.clients[userId].avatarDetail?.thumbnailURL || DEFAULT_PROFILE_IMG_PLACEHOLDER;
}