class LoadingManager {
  onStart: (...args: any[]) => void
  onLoad: (...args: any[]) => void
  onProgress: (...args: any[]) => void
  onError: (...args: any[]) => void
  itemStart: (url: string) => void
  itemEnd: (url: string) => void
  itemError: (url: string) => void
  resolveURL: (url: string) => string
  setURLModifier: (transform) => LoadingManager
  addHandler: (regex: RegExp, loader) => LoadingManager
  removeHandler: (regex: RegExp) => LoadingManager
  getHandler: (file: string) => any
  constructor(onLoad, onProgress, onError) {
    let isLoading = false
    let itemsLoaded = 0
    let itemsTotal = 0
    let urlModifier: any = undefined
    const handlers: Array<RegExp> = []

    this.onLoad = onLoad
    this.onProgress = onProgress
    this.onError = onError

    this.itemStart = function (url) {
      itemsTotal++

      if (isLoading === false) {
        if (this.onStart !== undefined) {
          this.onStart(url, itemsLoaded, itemsTotal)
        }
      }

      isLoading = true
    }

    this.itemEnd = function (url) {
      itemsLoaded++

      if (this.onProgress !== undefined) {
        this.onProgress(url, itemsLoaded, itemsTotal)
      }

      if (itemsLoaded === itemsTotal) {
        isLoading = false

        if (this.onLoad !== undefined) {
          this.onLoad()
        }
      }
    }

    this.itemError = function (url) {
      if (this.onError !== undefined) {
        this.onError(url)
      }
    }

    this.resolveURL = function (url) {
      if (urlModifier) {
        return urlModifier(url)
      }

      return url
    }

    this.setURLModifier = function (transform) {
      urlModifier = transform

      return this
    }

    this.addHandler = function (regex, loader) {
      handlers.push(regex, loader)

      return this
    }

    this.removeHandler = function (regex) {
      const index = handlers.indexOf(regex)

      if (index !== -1) {
        handlers.splice(index, 2)
      }

      return this
    }

    this.getHandler = function (file) {
      for (let i = 0, l = handlers.length; i < l; i += 2) {
        const regex = handlers[i]
        const loader = handlers[i + 1]

        if (regex.global) regex.lastIndex = 0 // see #17920

        if (regex.test(file)) {
          return loader
        }
      }

      return null
    }
  }
}

const DefaultLoadingManager = new LoadingManager(undefined, undefined, undefined)

export { DefaultLoadingManager, LoadingManager }
