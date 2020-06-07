/* global NAF */

import AvatarSchema, { defaultComponents } from './avatar-schema'
import AvatarModelEnum from '../../../enums/avatar-model'
import AvatarAsset from './avatar-asset'
import AvatarAssetGLTF from './avatar-asset-gltf'
import AvatarAssetHTML from './avatar-asset-html'

export default class Avatar {
  template: string
  avatarAsset: AvatarAsset
  schema: AvatarSchema

  constructor(public templateID = defaultTemplateID, public components = defaultComponents, public options = defaultAvatarOptions) {
    this.schema = new AvatarSchema(this.templateID, this.components)
    this.avatarAsset = options.assetType === AvatarModelEnum.GLTF ? new AvatarAssetGLTF() : new AvatarAssetHTML()
    this.template = this.constructTemplate()
  }

  setupTemplate() {
    this.addTemplateToAssets()
    this.addTemplateToNAF()
  }

  addTemplateToAssets() {
    const frag = this.fragmentFromString(this.template)
    document.querySelector('a-assets').appendChild(frag)
  }

  addTemplateToNAF() {
    // @ts-ignore
    (NAF as any).schemas.add(this.schema)
  }

  addTemplateToPlayer(player: HTMLElement) {
    player.setAttribute('networked', {
      template: '#' + this.templateID,
      attachTemplateToLocal: this.options.attachTemplateToLocal
    })
  }

  addTemplateToPlayerByID(playerID: string = 'player') {
    const player = document.getElementById(playerID) as HTMLElement
    this.addTemplateToPlayer(player)
  }

  fragmentFromString(HTML: string) {
    return document.createRange().createContextualFragment(HTML)
  }

  constructTemplate() {
    return `
          <template id="${this.templateID}">
                <a-entity class="avatar">
                ${this.avatarAsset.assetString}
                </a-entity>
              </template>
          `
  }
}

export type AvatarOptions = {
  attachTemplateToLocal: boolean,
  assetType: AvatarModelEnum
}

export const defaultAvatarOptions = {
  attachTemplateToLocal: false,
  assetType: AvatarModelEnum.GLTF
}

export const defaultTemplateID: string = 'avatar-template'
