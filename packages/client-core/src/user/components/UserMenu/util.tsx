import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

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
  Emote: 'Emote',
  NewLocation: 'NewLocation',
  ReadyPlayer: 'ReadyPlayer',
  Inventory: 'Inventory',
  Wallet: 'Wallet',
  Trading: 'Trading'
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
  provisionServer?: any
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

export function getAvatarURLForUser(userId?: UserId) {
  const world = Engine.currentWorld
  if (!world || !userId) return DEFAULT_PROFILE_IMG_PLACEHOLDER
  if (!world.clients.has(userId)) return DEFAULT_PROFILE_IMG_PLACEHOLDER
  return world.clients.get(userId)!.avatarDetail?.thumbnailURL || DEFAULT_PROFILE_IMG_PLACEHOLDER
}
