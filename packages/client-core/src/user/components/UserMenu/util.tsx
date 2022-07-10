import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { getState, useState } from '@xrengine/hyperflux'

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

export function useAvatarURLForUser(userId?: UserId) {
  const world = Engine.instance.currentWorld
  if (!world || !userId) return DEFAULT_PROFILE_IMG_PLACEHOLDER
  const userAvatarDetails = useState(getState(WorldState)).userAvatarDetails
  return userAvatarDetails[userId].thumbnailURL?.value || DEFAULT_PROFILE_IMG_PLACEHOLDER
}
