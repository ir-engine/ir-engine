export interface AvatarInterface {
  id: string
  sid?: string
  key?: string
  name?: string
  url?: string
  staticResourceType?: string
  userId: string
  description?: string
}

export type AvatarProps = {
  avatarId?: string
  avatarURL: string
  thumbnailURL?: string
}
