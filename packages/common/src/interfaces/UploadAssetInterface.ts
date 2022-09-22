export type AvatarUploadType = {
  type: 'user-avatar-upload'
  files: (Blob | Buffer)[]
  userId?: string
  args: {
    avatarName: string
    isPublic: boolean
  }
}

export type AdminAssetUploadArgumentsType = {
  id?: string
  key: string
  staticResourceType?: string
  userId?: string
  name?: string
}

export type AdminAssetUploadType = {
  type: 'admin-file-upload'
  files: (Blob | Buffer)[]
  args: Array<AdminAssetUploadArgumentsType>
  userId?: string
}

export type AssetUploadType = AvatarUploadType | AdminAssetUploadType

export interface UploadFile {
  buffer: Buffer
  mimetype: string
}
