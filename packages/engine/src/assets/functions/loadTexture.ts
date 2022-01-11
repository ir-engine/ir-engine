import { Texture, TextureLoader } from 'three'
import { TGALoader } from '../loaders/tga/TGALoader'

export default function loadTexture(src: string, textureLoader?: TextureLoader | TGALoader) {
  let loader: TextureLoader | TGALoader = textureLoader!
  if (!loader) {
    loader = src.endsWith('tga') ? new TGALoader() : new TextureLoader()
  }

  return new Promise<Texture>((resolve, reject) => {
    loader.load(src, resolve, undefined, (_) => {
      reject(new Error(`Error loading texture "${src}"`))
    })
  })
}
