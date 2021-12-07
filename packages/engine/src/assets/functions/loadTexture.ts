import { TextureLoader } from 'three'
import { isClient } from '../../common/functions/isClient'

export default function loadTexture(src, textureLoader: any = new TextureLoader()) {
  return new Promise((resolve, reject) => {
    if (!isClient) resolve(null)
    textureLoader.load(src, resolve, null, (error) =>
      reject(new Error(`Error loading texture "${src}"`))
    )
  })
}
