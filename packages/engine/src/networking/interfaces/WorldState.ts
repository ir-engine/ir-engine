import matches from 'ts-matches'

import { defineState } from '@xrengine/hyperflux'

export const matchesAvatarProps = matches.shape({
  avatarURL: matches.string,
  thumbnailURL: matches.string
})
export const UsersTypingState = defineState({
  store: 'WORLD',
  name: 'UsersTyping',
  initial: () => ({} as { [key: string]: true })
})
export type AvatarProps = typeof matchesAvatarProps._TYPE
