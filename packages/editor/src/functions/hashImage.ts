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

function getImageData(img: HTMLImageElement): ImageData | undefined {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  }
}

export default async function hashImage(img: HTMLImageElement): Promise<string> {
  const imageData = getImageData(img)

  if (imageData) {
    const digest = await crypto.subtle.digest('SHA-256', imageData.data)
    const hashArray = Array.from(new Uint8Array(digest))
    return hashArray.map((b) => ('00' + b.toString(16)).slice(-2)).join('')
  }

  return ''
}
