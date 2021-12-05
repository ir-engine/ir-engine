import { XMLHttpRequest } from 'xmlhttprequest'
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'
// Patch XHR for FileLoader in threejs
;(globalThis as any).XMLHttpRequest = XMLHttpRequest
;(globalThis as any).self = globalThis

// import URL from 'url'
;(globalThis as any).self.URL = URL

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
  innerWidth: THUMBNAIL_WIDTH,
  innerHeight: THUMBNAIL_HEIGHT,
  addEventListener
})

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
