import { Blob } from 'buffer'
import fetch, { Headers, Request, Response } from 'node-fetch'

// needed for URL.createObjectURL
import 'url-polyfill'

;(globalThis as any).fetch = fetch
;(globalThis as any).Request = Request
;(globalThis as any).Response = Response
;(globalThis as any).Headers = Headers
;(globalThis as any).self = globalThis

// import URL from 'url'
;(globalThis as any).self.URL = URL
;(globalThis as any).Blob = Blob

const _localStorage = {} as any
;(globalThis as any).localStorage = {
  setItem: (key, val) => {
    _localStorage[key] = val
  },
  getItem: (key) => {
    return _localStorage[key] ?? null
  }
}

// patches for headless-gl - currently unused

/*
// patch navigator
if (!globalThis.navigator)
  (globalThis as any).navigator = {
    product: 'NativeScript', // patch axios so it doesnt complain,
    userAgent: 'node'
  }

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
