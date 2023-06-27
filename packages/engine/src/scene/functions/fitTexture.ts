/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Texture } from 'three'

/** https://gist.github.com/bartwttewaall/5a1168d04a07d52eaf0571f7990191c2 **/

/**
 * @param {Texture} texture - a texture containing a loaded image with a defined width and height
 * @param {number} screenAspect - the aspect ratio (width / height) of the model that contains the texture
 * @param {"fit"|"fill"|"stretch"} mode - three modes of manipulating the texture offset and scale
 * @param {number} [alignH] - optional multiplier to align the texture horizontally - 0: left, 0.5: center, 1: right
 * @param {number} [alignV] - optional multiplier to align the texture vertically - 0: bottom, 0.5: middle, 1: top
 **/
export function fitTexture(
  texture: Texture,
  imageAspect: number,
  screenAspect: number,
  mode: 'fit' | 'fill' | 'stretch',
  alignH = 0.5,
  alignV = 0.5
) {
  const scale = imageAspect / screenAspect
  const offsetX = (imageAspect - screenAspect) / imageAspect
  const offsetY = (screenAspect - imageAspect) / screenAspect

  switch (mode) {
    case 'fit': {
      if (screenAspect < imageAspect) {
        texture.offset.set(0, offsetY * alignV)
        texture.repeat.set(1, scale)
      } else {
        texture.offset.set(offsetX * alignH, 0)
        texture.repeat.set(1 / scale, 1)
      }
      break
    }
    case 'fill': {
      if (screenAspect < imageAspect) {
        texture.offset.set(offsetX * alignH, 0)
        texture.repeat.set(1 / scale, 1)
      } else {
        texture.offset.set(0, offsetY * alignV)
        texture.repeat.set(1, scale)
      }
      break
    }
    case 'stretch':
    default: {
      texture.offset.set(0, 0)
      texture.repeat.set(1, 1)
      break
    }
  }
}
