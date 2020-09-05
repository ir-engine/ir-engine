export default class Cache {
  _cache = new Map();
  evict(url) {
    const absoluteURL = new URL(url, (window as any).location).href;
    this._cache.delete(absoluteURL);
  }
  _clear() {
    this._cache.clear();
  }
}
