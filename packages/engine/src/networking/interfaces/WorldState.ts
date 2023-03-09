import matches from 'ts-matches'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineState } from '@etherealengine/hyperflux'

export const matchesAvatarProps = matches.shape({
  avatarURL: matches.string,
  thumbnailURL: matches.string
})
export type AvatarProps = typeof matchesAvatarProps._TYPE

export const WorldState = defineState({
  name: 'WorldState',
  initial: () => ({
    userNames: {} as Record<UserId, string>,
    userAvatarDetails: {} as Record<UserId, AvatarProps>
  })
})
