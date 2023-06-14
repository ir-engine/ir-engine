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
  path: string
  staticResourceType?: string
  userId?: string
  name?: string
  project?: string
  hash?: string
  stats?: any
}

export type AdminAssetUploadType = {
  type: 'admin-file-upload'
  project: string
  files: Blob[]
  args: AdminAssetUploadArgumentsType
  variants: boolean
  userId?: string
}

export type AssetUploadType = AvatarUploadType | AdminAssetUploadType

export interface UploadFile {
  fieldname?: string
  originalname: string
  encoding?: string
  mimetype: string
  buffer: Buffer | string
  size: number
}
