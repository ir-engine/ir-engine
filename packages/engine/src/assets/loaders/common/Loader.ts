import { DefaultLoadingManager, LoadingManager } from './LoadingManager'

abstract class Loader {
  manager: LoadingManager
  crossOrigin: string
  withCredentials: boolean
  path: string
  resourcePath: string
  requestHeader: HeadersInit
  static DEFAULT_MATERIAL_NAME: string

  constructor(manager: LoadingManager | undefined) {
    this.manager = manager !== undefined ? manager : DefaultLoadingManager

    this.crossOrigin = 'anonymous'
    this.withCredentials = false
    this.path = ''
    this.resourcePath = ''
    this.requestHeader = {}
  }

  abstract load(
    url: string,
    onLoad: (...args: any[]) => void,
    onProgress: (...args: any[]) => void,
    onError: (...args: any[]) => void,
    signal: AbortSignal | undefined
  ): void

  loadAsync(url, onProgress, signal: AbortSignal | undefined) {
    return new Promise((resolve, reject) => {
      this.load(url, resolve, onProgress, reject, signal)
    })
  }

  parse(/* data */) {}

  setCrossOrigin(crossOrigin) {
    this.crossOrigin = crossOrigin
    return this
  }

  setWithCredentials(value) {
    this.withCredentials = value
    return this
  }

  setPath(path) {
    this.path = path
    return this
  }

  setResourcePath(resourcePath) {
    this.resourcePath = resourcePath
    return this
  }

  setRequestHeader(requestHeader) {
    this.requestHeader = requestHeader
    return this
  }
}

Loader.DEFAULT_MATERIAL_NAME = '__DEFAULT'

export { Loader }
