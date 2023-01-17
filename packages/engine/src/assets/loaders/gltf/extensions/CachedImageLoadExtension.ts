import { LoaderUtils, Texture, TextureLoader } from 'three'

import { GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

class CachedImageLoadExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_cachedImageLoad'

  static cache = new Map<string, Promise<Texture>>()

  loadTexture(textureIndex) {
    const json = this.parser.json
    const options = this.parser.options
    const textureDef = json.textures[textureIndex]
    const sourceIdx = textureDef.source
    const sourceDef = json.images[sourceIdx]
    const uri = sourceDef.uri ?? ''
    const url = LoaderUtils.resolveURL(uri, options.path!)
    if (!CachedImageLoadExtension.cache.has(url))
      CachedImageLoadExtension.cache.set(
        url,
        this.parser.loadTextureImage(textureIndex, sourceIdx, new TextureLoader())
      )
    return CachedImageLoadExtension.cache.get(url)!
  }
}

export { CachedImageLoadExtension }
