import matches from 'ts-matches'

export const matchesAvatarProps = matches.shape({
  avatarURL: matches.string,
  thumbnailURL: matches.string,
  avatarId: matches.string
})

export type AvatarProps = typeof matchesAvatarProps._TYPE
