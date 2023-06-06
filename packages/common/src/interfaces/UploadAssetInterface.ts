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
  stats?: any
}

export type AdminAssetUploadType = {
  type: 'admin-file-upload'
  files: Blob[]
  args: AdminAssetUploadArgumentsType
  variants: boolean
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
  fieldname?: string
  originalname: string
  encoding?: string
  mimetype: string
  buffer: Buffer
  size: number
}
