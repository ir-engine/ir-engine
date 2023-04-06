export type AvatarUploadArgsType = {
  avatarName: string
  avatarId: string
  isPublic: boolean
}

export type AvatarUploadType = {
  type: 'user-avatar-upload'
  files: (Blob | Buffer)[]
  userId?: string
  args: string | AvatarUploadArgsType
}

export type AdminAssetUploadArgumentsType = {
  id?: string
  key: string
  staticResourceType?: string
  userId?: string
  name?: string
  project?: string
  hash?: string
  numLODs?: number
  stats?: any
}

export type AdminAssetUploadType = {
  type: 'admin-file-upload'
  files: (Blob | Buffer)[]
  args: AdminAssetUploadArgumentsType
  userId?: string
}

export type AudioUploadType = {
  type: 'audio-upload'
  files: (Blob | Buffer)[]
  args: AudioUploadArgumentsType
}

export type AudioUploadArgumentsType = {
  id?: string
  key: string
  staticResourceType?: string
  userId?: string
  name?: string
}

export type AssetUploadType = AvatarUploadType | AdminAssetUploadType | AudioUploadType

export interface UploadFile {
  buffer: Buffer
  mimetype: string
}
