import { isClient } from './common/functions/getEnvironment'

if (!isClient) {
  const { Blob } = require('buffer')
  const fetch = require('node-fetch')

  globalThis.fetch = fetch
  globalThis.Request = fetch.Request
  globalThis.Response = fetch.Response
  globalThis.Headers = fetch.Headers
  globalThis.self = globalThis as Window & typeof globalThis

  // this will be added in node 19
  if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = (blob) => null!
  if (!globalThis.Blob) globalThis.Blob = Blob

  const _localStorage = {}
  if (!globalThis.localStorage)
    globalThis.localStorage = {
      setItem: (key, val) => {
        _localStorage[key] = val
      },
      getItem: (key) => {
        return _localStorage[key] ?? null
      }
    } as Storage

  // patches for headless-gl - currently unused

  // patch navigator
  if (!globalThis.navigator)
    (globalThis as any).navigator = {
      product: 'NativeScript', // patch axios so it doesnt complain,
      userAgent: 'node'
    }
  /*
  
  // todo: move this out of module scope
  function addEventListener(event, func, bind_) {}
  
  // patch window prop for three
  if (!globalThis.window) (globalThis as any).window = {}
  Object.assign((globalThis as any).window, {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener,
    URL
  })
  
  class Image {}
  
  // patch three ImageLoader
  if (!globalThis.document) (globalThis as any).document = {}
  Object.assign((globalThis as any).document, {
    createElement: (type, ...args) => {
      switch (type) {
        case 'div': // patch for sinon
        default:
          return
      }
    },
    URL,
    createElementNS: (ns, type) => {
      if (type === 'img') {
        const img = new Image() as any
        img.addEventListener = (type, handler) => {
          img['on' + type] = handler.bind(img)
        }
        img.removeEventListener = (type) => {
          img['on' + type] = null
        }
        return img
      }
    }
  })
  */
}
