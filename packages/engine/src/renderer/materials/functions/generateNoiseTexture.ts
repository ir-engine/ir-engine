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

import { Noise } from 'noisejs'
import { DataTexture, LinearFilter, RedFormat, RepeatWrapping, UnsignedByteType } from 'three'

export function generateNoiseTexture(textureSize: number) {
  const noise = new Noise(Math.random())

  // Create a data array to store the noise values
  const size = textureSize * textureSize * textureSize
  const data = new Uint8Array(4 * size)
  const scale = 5
  // Fill the data array with noise values
  for (let k = 0; k < textureSize; k++) {
    for (let j = 0; j < textureSize; j++) {
      for (let i = 0; i < textureSize; i++) {
        let value = noise.perlin3(i / scale, j / scale, k / scale)
        value = ((value + 1) / 2) * 255 // remap from -1,1 to 0,255

        const index = i + j * textureSize + k * textureSize * textureSize
        data[index] = value // Only set the red channel
      }
    }
  }

  // Create a js data texture
  const noiseTexture = new DataTexture(data, textureSize, textureSize * textureSize)
  noiseTexture.format = RedFormat
  noiseTexture.type = UnsignedByteType
  noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping
  noiseTexture.minFilter = LinearFilter
  noiseTexture.magFilter = LinearFilter
  noiseTexture.unpackAlignment = 1
  noiseTexture.needsUpdate = true
  return noiseTexture
}
