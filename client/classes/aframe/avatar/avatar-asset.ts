import AvatarModelEnum from '../../../enums/avatar-model'
export default abstract class AvatarAsset {
  assetString: string

  constructor(public type: AvatarModelEnum = AvatarModelEnum.HTML) {
    this.assetString = ''
  }

  abstract createAssetString() : string
}
