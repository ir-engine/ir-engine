import AvatarModelEnum from '../../../enums/avatar-model'
import AvatarAsset from './avatar-asset'

import getConfig from 'next/config'
const config = getConfig().publicRuntimeConfig.xr.avatar

export default class AvatarAssetGLTF extends AvatarAsset {
  constructor(public src: string = defaultAvatarModelSrc, public scale = defaultAvatarModelScale) {
    super(AvatarModelEnum.GLTF)
    this.assetString = this.createAssetString()
  }

  // TODO : add gltf asset to a-assets, ref id in createAssetString
  createAssetString() : string {
    return `<a-gltf-model class="gltfmodel" src="${this.src}"
                    scale="${this.scaleString}">
                </a-gltf-model>`
  }

  get scaleString() : string {
    return `${this.scale} ${this.scale} ${this.scale}`
  }
}

export const defaultAvatarModelSrc : string = config.defaultAvatarModelSrc
export const defaultAvatarModelScale : number = config.defaultAvatarModelScale
