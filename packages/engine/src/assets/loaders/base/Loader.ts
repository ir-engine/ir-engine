import { DefaultLoadingManager, LoadingManager } from 'three'

class Loader<TData = unknown, TUrl = string> {
  static DEFAULT_MATERIAL_NAME = '__DEFAULT'

  manager: LoadingManager
  crossOrigin: string
  withCredentials: boolean
  path: string
  resourcePath: string
  requestHeader: { [header: string]: string }

  constructor(manager?: LoadingManager) {
    this.manager = manager !== undefined ? manager : DefaultLoadingManager

    this.crossOrigin = 'anonymous'
    this.withCredentials = false
    this.path = ''
    this.resourcePath = ''
    this.requestHeader = {}
  }

  load(
    url: TUrl,
    onLoad: (data: TData) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {}

  loadAsync(url, onProgress) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this

    return new Promise(function (resolve, reject) {
      scope.load(url, resolve, onProgress, reject)
    })
  }

  parse(data?: any) {}

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

export { Loader }
