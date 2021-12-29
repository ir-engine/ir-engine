// patches for headless-gl - currently unused

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
