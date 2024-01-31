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

/**
 * A blend function enumeration.
 *
 * @type {Object}
 * @property {Number} SKIP - No blending. The effect will not be included in the final shader.
 * @property {Number} ADD - Additive blending. Fast, but may produce washed out results.
 * @property {Number} ALPHA - Alpha blending. Blends based on the alpha value of the new color.
 * @property {Number} AVERAGE - Average blending.
 * @property {Number} COLOR_BURN - Color burn.
 * @property {Number} COLOR_DODGE - Color dodge.
 * @property {Number} DARKEN - Prioritize darker colors.
 * @property {Number} DIFFERENCE - Color difference.
 * @property {Number} EXCLUSION - Color exclusion.
 * @property {Number} LIGHTEN - Prioritize lighter colors.
 * @property {Number} MULTIPLY - Color multiplication.
 * @property {Number} DIVIDE - Color division.
 * @property {Number} NEGATION - Color negation.
 * @property {Number} NORMAL - Normal blending. The new color overwrites the old one.
 * @property {Number} OVERLAY - Color overlay.
 * @property {Number} REFLECT - Color reflection.
 * @property {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
 * @property {Number} SOFT_LIGHT - Soft light blending.
 * @property {Number} SUBTRACT - Color subtraction.
 */

export const BlendFunction = {
  SKIP: 0,
  ADD: 1,
  ALPHA: 2,
  AVERAGE: 3,
  COLOR_BURN: 4,
  COLOR_DODGE: 5,
  DARKEN: 6,
  DIFFERENCE: 7,
  EXCLUSION: 8,
  LIGHTEN: 9,
  MULTIPLY: 10,
  DIVIDE: 11,
  NEGATION: 12,
  NORMAL: 13,
  OVERLAY: 14,
  REFLECT: 15,
  SCREEN: 16,
  SOFT_LIGHT: 17,
  SUBTRACT: 18
}
