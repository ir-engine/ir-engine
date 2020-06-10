import AvatarModelEnum from '../../../enums/avatar-model'
import AvatarAsset from './avatar-asset'

export default class AvatarAssetHTML extends AvatarAsset {
  constructor(public html: string = defaultAvatarModelHtml) {
    super(AvatarModelEnum.HTML)
    this.assetString = this.createAssetString()
  }

  createAssetString() {
    return this.html
  }
}

export const defaultAvatarModelHtml : string = `<a-entity class="avatar">
                  <a-sphere class="head"
                    scale="0.45 0.5 0.4"
                  ></a-sphere>
                  <a-entity class="face"
                    position="0 0.05 0"
                  >
                    <a-sphere class="eye"
                      color="#efefef"
                      position="0.16 0.1 -0.35"
                      scale="0.12 0.12 0.12"
                    >
                      <a-sphere class="pupil"
                        color="#000"
                        position="0 0 -1"
                        scale="0.2 0.2 0.2"
                      ></a-sphere>
                    </a-sphere>
                    <a-sphere class="eye"
                      color="#efefef"
                      position="-0.16 0.1 -0.35"
                      scale="0.12 0.12 0.12"
                    >
                      <a-sphere class="pupil"
                        color="#000"
                        position="0 0 -1"
                        scale="0.2 0.2 0.2"
                      ></a-sphere>
                    </a-sphere>
                  </a-entity>
                </a-entity>`
