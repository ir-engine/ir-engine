import matches from 'ts-matches'

import { defineState } from '@xrengine/hyperflux'

export const matchesAvatarProps = matches.shape({
  avatarURL: matches.string,
  thumbnailURL: matches.string
})
export type AvatarProps = typeof matchesAvatarProps._TYPE

export const WorldState = defineState({
  store: 'WORLD',
  name: 'WorldState',
  initial: () => ({
    usersTyping: {} as { [key: string]: true }
  })
})
