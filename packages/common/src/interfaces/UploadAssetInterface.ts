export type AvatarUploadType = {
  type: 'user-avatar-upload'
  files: (Blob | Buffer)[]
  args: {
    avatarName: string
    isPublicAvatar: boolean
  }
}

export type IPFSUploadType = {
  type: 'ipfs-file-upload'
  files: (Blob | Buffer)[]
  args: Array<AdminAssetUploadArgumentsType>
}

export type AdminAssetUploadArgumentsType = {
  key: string
  contentType: string
  staticResourceType: string
  userId?: string
  name?: string
}

export type AdminAssetUploadType = {
  type: 'admin-file-upload'
  files: (Blob | Buffer)[]
  args: Array<AdminAssetUploadArgumentsType>
}

export type AssetUploadType = AvatarUploadType | AdminAssetUploadType | IPFSUploadType
