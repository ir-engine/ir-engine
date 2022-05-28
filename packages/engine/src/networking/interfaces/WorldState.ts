import matches from 'ts-matches'

import { defineState } from '@xrengine/hyperflux'

export const matchesAvatarProps = matches.shape({
  avatarURL: matches.string,
  thumbnailURL: matches.string
})
export type AvatarProps = typeof matchesAvatarProps._TYPE

export const WorldState = defineState({
  name: 'WorldState',
  initial: () => ({})
})
