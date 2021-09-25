export const Views = {
  Closed: '',
  Profile: 'Profile',
  Settings: 'Settings',
  Share: 'Share',
  DeleteAccount: 'accountDelete',
  Login: 'login',
  AvatarUpload: 'AvatarUpload',
  Avatar: 'Avatar',
  Location: 'Location',
  NewLocation: 'NewLocation'
}

export interface UserMenuProps {
  login?: boolean
  authState?: any
  instanceConnectionState?: any
  locationState?: any
  updateUserAvatarId?: Function
  showDialog?: Function
  alertSuccess?: Function
  currentScene?: any
  provisionInstanceServer?: any
  uploadAvatarModel?: Function
  fetchAvatarList?: Function
  updateUserSettings?: Function
  removeAvatar?: Function
  getLocations?: Function
  enableSharing?: boolean
  hideLogin?: boolean
  showHideProfile?: Function
}

export interface SettingMenuProps {
  activeMenu: any
  setActiveMenu?: Function
}
