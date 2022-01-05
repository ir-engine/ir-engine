import { Texture, TextureLoader } from 'three'
import { isClient } from '../../common/functions/isClient'

export default function loadTexture(src, textureLoader = new TextureLoader()) {
  return new Promise<Texture | null>((resolve, reject) => {
    if (!isClient) resolve(null)
    textureLoader.load(src, resolve, undefined, (_) => {
      reject(new Error(`Error loading texture "${src}"`))
    })
  })
}
