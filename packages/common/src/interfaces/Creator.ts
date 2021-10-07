export interface CreatorShort {
  id: string
  userId?: string
  avatar?: string
  newAvatar?: string
  name: string
  username: string
  verified?: boolean
  steps?: boolean
  terms?: boolean
  policy?: boolean
  blocked?: boolean
  followed?: boolean
  isBlocked?: boolean
  createdAt?: string
}

export interface Creator extends CreatorShort {
  email?: string
  link?: string
  background?: string
  tags?: string
  bio?: string
  twitter?: string
}
