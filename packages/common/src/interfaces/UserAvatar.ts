export interface UserAvatar {
  avatar?: AvatarItem
  userThumbnail?: UserThumbnail
}

interface AvatarItem {
  id?: string
  key?: string
  name?: string
  url?: string
  staticResourceType?: string
  userId?: string
}

interface UserThumbnail {
  id?: string
  key?: string
  name?: string
  url?: string
  staticResourceType?: string
  userId?: string
}
