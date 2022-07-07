export interface UserAvatar {
  avatar?: AvatarItem
  userThumbnail?: UserThumbnail
  'user-thumbnail'?: UserThumbnail // sequelize is frustrating
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
