import type { Network } from '@xrengine/engine/src/networking/classes/Network'

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
}

export interface SettingMenuProps {
  activeMenu: any
  setActiveMenu?: Function
}

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = '/placeholders/default-silhouette.svg'

export const getAvatarURLFromNetwork = (network: Network, userId: string) => {
  if (!network || !userId) return DEFAULT_PROFILE_IMG_PLACEHOLDER
  if (!network.clients[userId]) return DEFAULT_PROFILE_IMG_PLACEHOLDER
  return network.clients[userId].avatarDetail?.thumbnailURL || DEFAULT_PROFILE_IMG_PLACEHOLDER
}
