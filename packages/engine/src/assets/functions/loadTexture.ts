import { TextureLoader } from 'three'

export default function loadTexture(src, textureLoader: any = new TextureLoader()) {
  return new Promise((resolve, reject) => {
    textureLoader.load(src, resolve, null, (error) => reject(new Error(`Error loading texture "${src}"`)))
  })
}
