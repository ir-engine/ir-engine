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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

export const distanceVariant = {
  none: ``,
  low: `shadow-lg`,
  high: `shadow-xl`
}

export const fadeVariant = {
  darker: `
    border-2
    bg-black/20
    border-black/10
    hover:bg-transparent
    active:bg-white/10
  `,
  dark: `
    border-2
    bg-black/10
    border-white/[0.05]
    hover:bg-black/5
    active:bg-white/10
  `,
  clear: `
    border-0
    hover:bg-white/20
    active:bg-white/30
  `,
  light: `
    border-2
    bg-white/10
    border-white/10
    hover:bg-white/20
    active:bg-white/30
  `,
  lighter: `
    border-2
    bg-white/20
    border-white/10
    hover:bg-white/30
    active:bg-white/40
  `
}

export const blurVariant = {
  none: ``,
  small: `backdrop-blur-md`,
  medium: `backdrop-blur-lg`,
  large: `backdrop-blur-3xl`
}

export const baseButtonStyles = `
  flex
  items-center
  justify-center
  
  text-white
  text-center
  font-bold
  
  rounded-full
  transition-colors
`
