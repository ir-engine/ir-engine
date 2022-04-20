import matches from 'ts-matches'

import { matchesUserId } from '@xrengine/hyperflux'

export const matchesAvatarProps = matches.shape({
  avatarURL: matches.string,
  thumbnailURL: matches.string
})

export const typingDetailProps = matches.shape({
  typing: matches.boolean,
  user: matchesUserId
})

export type AvatarProps = typeof matchesAvatarProps._TYPE
export type TypingDetailProps = typeof typingDetailProps._TYPE
