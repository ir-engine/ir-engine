import { Cache } from './Cache'
import { Loader } from './Loader'

function createElementNS(name) {
  return document.createElementNS('http://www.w3.org/1999/xhtml', name)
}

class ImageLoader extends Loader {
  constructor(manager) {
    super(manager)
  }

  load(url, onLoad, onProgress, onError) {
    if (this.path !== undefined) url = this.path + url

    url = this.manager.resolveURL(url)

    const cached = Cache.get(url)

    if (cached !== undefined) {
      this.manager.itemStart(url)

      setTimeout(function () {
        if (onLoad) onLoad(cached)

        this.manager.itemEnd(url)
      }, 0)

      return cached
    }

    const image = createElementNS('img')

    function onImageLoad() {
      removeEventListeners()

      Cache.add(url, this)

      if (onLoad) onLoad(this)

      this.manager.itemEnd(url)
    }

    function onImageError(event) {
      removeEventListeners()

      if (onError) onError(event)

      this.manager.itemError(url)
      this.manager.itemEnd(url)
    }

    function removeEventListeners() {
      image.removeEventListener('load', onImageLoad, false)
      image.removeEventListener('error', onImageError, false)
    }

    image.addEventListener('load', onImageLoad, false)
    image.addEventListener('error', onImageError, false)

    if (url.slice(0, 5) !== 'data:') {
      // @ts-ignore
      if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin
    }

    this.manager.itemStart(url)

    // @ts-ignore
    image.src = url

    return image
  }
}

export { ImageLoader }
