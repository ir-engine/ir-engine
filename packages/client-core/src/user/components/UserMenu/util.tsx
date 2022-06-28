import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { accessUserState } from '../../services/UserService'

export const Views = {
  Closed: '',
  Profile: 'Profile',
  Settings: 'Settings',
  Share: 'Share',
  DeleteAccount: 'accountDelete',
  Login: 'Login',
  AvatarUpload: 'AvatarUpload',
  Avatar: 'Avatar',
  Emote: 'Emote',
  ReadyPlayer: 'ReadyPlayer',
  AvatarSelect: 'AvatarSelect'
}

export interface SettingMenuProps {
  activeMenu: any
  setActiveMenu?: Function
}

export const DEFAULT_PROFILE_IMG_PLACEHOLDER = '/placeholders/default-silhouette.svg'

export function getAvatarURLForUser(userId?: UserId) {
  const userState = accessUserState()
  const world = Engine.instance.currentWorld
  if (!world || !userId) return DEFAULT_PROFILE_IMG_PLACEHOLDER
  if (!world.users.has(userId)) return DEFAULT_PROFILE_IMG_PLACEHOLDER
  return world.users.get(userId)!.avatarDetail?.thumbnailURL || DEFAULT_PROFILE_IMG_PLACEHOLDER
}
