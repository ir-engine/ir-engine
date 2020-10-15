import { GLTFLoader } from "@xr3ngine/engine/src/assets/loaders/glTF/GLTFLoader";

export default class GLTFCache {
  cache: Map<any, any>;
  constructor() {
    this.cache = new Map();
  }
  getLoader(url, options) {
    const absoluteURL = new URL(url, (window as any).location).href;
    if (this.cache.has(absoluteURL)) {
      return this.cache.get(absoluteURL);
    } else {
      const loader = new GLTFLoader(absoluteURL, undefined, { revokeObjectURLs: false, ...options });
      this.cache.set(absoluteURL, loader);
      return loader;
    }
  }
  disposeAndClear() {
    this.cache.clear();
  }
}
