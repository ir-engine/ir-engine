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
