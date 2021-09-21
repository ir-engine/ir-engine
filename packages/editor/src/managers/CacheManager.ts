import GLTFCache from '../caches/GLTFCache'
import TextureCache from '../caches/TextureCache'

export class CacheManager {
  static textureCache: TextureCache
  static gltfCache: GLTFCache

  static init() {
    this.textureCache = new TextureCache()
    this.gltfCache = new GLTFCache()
  }

  /**
   * Function clearCaches used to clear cashe.
   *
   * @author Robert Long
   */
  static clearCaches() {
    this.textureCache.disposeAndClear()
    this.gltfCache.disposeAndClear()
  }
}
