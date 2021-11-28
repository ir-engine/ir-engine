export type AssetUploadArguments = {
  avatar: Blob | Buffer
  thumbnail: Blob | Buffer
  avatarName: string
  isPublicAvatar?: boolean
}
