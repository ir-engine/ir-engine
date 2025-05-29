/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { PMREMGenerator, Texture } from 'three'
import { getTextureCacheSize, restoreTextureData, textureNeedsRestoration } from './TextureMemoryManager'

/**
 * Apply patches to Three.js Texture classes to handle texture memory management
 * This adds the necessary functionality without requiring custom subclasses
 */
export function applyTexturePatch() {
  getTextureCacheSize().then((size) => {
    console.log(`Texture cache contains ${size} entries`)
  })

  const originalNeedsUpdateSetter = Object.getOwnPropertyDescriptor(Texture.prototype, 'needsUpdate')?.set

  if (originalNeedsUpdateSetter) {
    Object.defineProperty(Texture.prototype, 'needsUpdate', {
      set: function (value) {
        if (value && textureNeedsRestoration(this)) {
          restoreTextureData(this)
            .then((success) => {
              if (success) {
                originalNeedsUpdateSetter.call(this, value)
              } else {
                originalNeedsUpdateSetter.call(this, value)
              }
            })
            .catch((error) => {
              console.error('Error restoring texture:', error)
              originalNeedsUpdateSetter.call(this, value)
            })
        } else {
          originalNeedsUpdateSetter.call(this, value)
        }
      },
      configurable: true
    })
  }

  const _fromTexture = PMREMGenerator.prototype['_fromTexture']
  PMREMGenerator.prototype['_fromTexture'] = function (texture: Texture, renderTarget: any) {
    if (textureNeedsRestoration(texture)) {
      restoreTextureData(texture).catch((error) => {
        console.error('Error restoring texture for PMREM:', error)
      })
    }

    texture.needsUpdate = true
    return _fromTexture.call(this, texture, renderTarget)
  }
}
