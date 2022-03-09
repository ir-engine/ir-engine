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

export interface CreateEditAdminAvatar {
  name: string
  description: string
  url: string
  staticResourceType: string
  key?: string
}
