import { TextureLoader } from 'three'
import loadTexture from '@xrengine/engine/src/assets/functions/loadTexture'

class Cache {
  _cache = new Map()
  evict(url) {
    const absoluteURL = new URL(url, (window as any).location).href
    this._cache.delete(absoluteURL)
  }
  _clear() {
    this._cache.clear()
  }
}

export default class TextureCache extends Cache {
  textureLoader: TextureLoader
  constructor() {
    super()
    this.textureLoader = new TextureLoader()
  }
  get(url) {
    const absoluteURL = new URL(url, (window as any).location).href
    if (!this._cache.has(absoluteURL)) {
      this._cache.set(absoluteURL, loadTexture(absoluteURL, this.textureLoader))
    }
    return this._cache.get(absoluteURL)
  }
  disposeAndClear() {
    for (const texturePromise of this._cache.values()) {
      texturePromise.then((texture) => texture.dispose())
    }
    this._clear()
  }
}
