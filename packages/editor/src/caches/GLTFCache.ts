import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
export default class GLTFCache {
  cache: Map<any, any>
  constructor() {
    this.cache = new Map()
  }
  get(url) {
    const absoluteURL = new URL(url, (window as any).location).href
    if (this.cache.has(absoluteURL)) {
      return this.cache.get(absoluteURL)
    } else {
      const loadPromise = AssetLoader.loadAsync(url)
      this.cache.set(absoluteURL, loadPromise)
      loadPromise.catch((e) => {
        this.cache.delete(absoluteURL)
      })
      return loadPromise
    }
  }
  disposeAndClear() {
    this.cache.clear()
  }
}
