// import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@xrengine/common/src/constants/AvatarConstants'

import fetch, { Request, Response, Headers } from 'node-fetch'
;(globalThis as any).fetch = fetch
;(globalThis as any).Request = Request
;(globalThis as any).Response = Response
;(globalThis as any).Headers = Headers
;(globalThis as any).self = globalThis

// import URL from 'url'
;(globalThis as any).self.URL = URL

// patches for headless-gl - currently unused

// // patch navigator
// if (!globalThis.navigator)
//   (globalThis as any).navigator = {
//     product: 'NativeScript', // patch axios so it doesnt complain,
//     userAgent: 'node'
//   }

// // todo: move this out of module scope
// function addEventListener(event, func, bind_) {}

// // patch window prop for three
// if (!globalThis.window) (globalThis as any).window = {}
// Object.assign((globalThis as any).window, {
//   innerWidth: THUMBNAIL_WIDTH,
//   innerHeight: THUMBNAIL_HEIGHT,
//   addEventListener
// })

// // patch three ImageLoader
// if (!globalThis.document) (globalThis as any).document = {}
// Object.assign((globalThis as any).document, {
//   createElement: (type, ...args) => {
//     switch (type) {
//       case 'div': // patch for sinon
//       default:
//         return
//     }
//   },
//   createElementNS: (ns, type) => {
//     if (type === 'img') {
//       const img = new Image() as any
//       img.addEventListener = (type, handler) => {
//         img['on' + type] = handler.bind(img)
//       }
//       img.removeEventListener = (type) => {
//         img['on' + type] = null
//       }
//       return img
//     }
//   }
// })
