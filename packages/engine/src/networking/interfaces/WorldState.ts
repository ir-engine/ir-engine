import matches from 'ts-matches'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { defineState } from '@xrengine/hyperflux'

export const matchesAvatarProps = matches.shape({
  avatarURL: matches.string,
  thumbnailURL: matches.string
})
export const UsersTypingState = defineState({ store: 'WORLD', name: 'usersTyping', initial: () => [] as UserId[] })
export type AvatarProps = typeof matchesAvatarProps._TYPE
