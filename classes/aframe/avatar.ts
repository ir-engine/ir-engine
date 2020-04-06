/* global NAF */
// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'
// @ts-ignore
/// <reference path="../../node_modules/@types/aframe/index.d.ts" />
/// <reference path="./avatar-asset.ts" />

import AvatarSchema, { defaultComponents } from './avatar-schema'
// eslint-disable-next-line no-unused-vars
import AvatarAsset from './avatar-asset'
import AvatarAssetGLTF from './avatar-asset-gltf'

export default class Avatar {
  template: string
  avatarAsset: AvatarAsset
  schema: AvatarSchema

  constructor(public templateID = defaultTemplateID, public components = defaultComponents, public options = defaultAvatarOptions) {
    this.schema = new AvatarSchema(this.templateID, this.components)
    this.avatarAsset = new AvatarAssetGLTF()
    this.template = this.constructTemplate()
  }

  setupTemplate() {
    this.addTemplateToAssets()
    this.addTemplateToNAF()
  }

  addTemplateToAssets() {
    var frag = this.fragmentFromString(this.template)
    document.querySelector('a-assets').appendChild(frag)
  }

  addTemplateToNAF() {
    // @ts-ignore
    NAF.schemas.add(this.schema)
  }

  addTemplateToPlayer(player: AFRAME.Entity) {
    player.setAttribute('networked', {
      template: '#' + this.templateID,
      attachTemplateToLocal: this.options.attachTemplateToLocal
    })
  }

  addTemplateToPlayerByID(playerID: string = 'player') {
    const player = document.getElementById(playerID) as AFRAME.Entity
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
  attachTemplateToLocal: boolean
}

export const defaultAvatarOptions = {
  attachTemplateToLocal: false
}

export const defaultTemplateID: string = 'avatar-template'
