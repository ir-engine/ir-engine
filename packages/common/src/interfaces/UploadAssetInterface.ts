export type AvatarUploadType = {
  type: 'user-avatar-upload'
  files: (Blob | Buffer)[]
  userId?: string
  args: {
    avatarName: string
    isPublicAvatar: boolean
  }
}

export type AdminAssetUploadArgumentsType = {
  id?: string
  key: string
  mimeType: string
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
