import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { AvatarProps } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

export const Views = {
  Closed: '',
  Profile: 'Profile',
  Settings: 'Settings',
  Share: 'Share',
  Party: 'Party',
  DeleteAccount: 'accountDelete',
  Login: 'Login',
  AvatarUpload: 'AvatarUpload',
  Avatar: 'Avatar',
  Emote: 'Emote',
  ReadyPlayer: 'ReadyPlayer',
  AvatarSelect: 'AvatarSelect',
  Friends: 'Friends',
  AvatarContext: 'AvatarContext'
}

export interface SettingMenuProps {
  activeMenu: any
  setActiveMenu?: Function
}

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = '/placeholders/default-silhouette.svg'

export function getAvatarURLForUser(userAvatarDetails: State<Record<UserId, AvatarProps>>, userId?: UserId) {
  return (userId && userAvatarDetails[userId].thumbnailURL?.value) || DEFAULT_PROFILE_IMG_PLACEHOLDER
}
