import { EventDispatcher } from '@etherealengine/spatial/src/common/classes/EventDispatcher'
import { DOMMatrix, DOMMatrixReadOnly, DOMPoint, DOMPointReadOnly } from './patchDOMMatrix'

if (!globalThis.navigator) {
  ;(globalThis as any).navigator = {
    userAgent: 'node',
    platform: 'node',
    maxTouchPoints: 0
  }
}

if (!globalThis.window) {
  const windowListener = new EventDispatcher() as any
  ;(globalThis as any).window = windowListener
  Object.assign((globalThis as any).window, {
    screen: {
      width: 1920,
      height: 1080
    },
    devicePixelRatio: 1,
    orientation: 0,
    navigator: globalThis.navigator
  } as Partial<Window>)
}

if (!globalThis.HTMLCanvasElement) {
  ;(globalThis as any).HTMLCanvasElement = class HTMLCanvasElement extends EventDispatcher {
    width = 1920
    height = 1080
    getDrawingBufferSize: () => 0
    parentElement: {
      clientWidth: 100
      clientHeight: 100
    }
    getContext() {
      return {
        viewport: () => {}
      } as Partial<WebGL2RenderingContext>
    }
  }
}

if (!globalThis.WebGLRenderingContext) {
  const WebGL2RenderingContext = class WebGL2RenderingContext {}
  ;(globalThis as any).WebGLRenderingContext = WebGL2RenderingContext
  ;(window as any).WebGL2RenderingContext = WebGL2RenderingContext
}

if (!globalThis.MutationObserver) {
  ;(globalThis as any).MutationObserver = class MutationObserver {
    observe() {}
  }
}

if (!globalThis.location) {
  ;(globalThis as any).location = {
    href: 'http://localhost'
  }
}

if (!globalThis.document) {
  const documentListener = new EventDispatcher() as any
  ;(globalThis as any).document = documentListener
  documentListener.createElement = (type: string) => {
    if (type === 'canvas') {
      return new HTMLCanvasElement()
    }
  }
  documentListener.location = globalThis.location
}

if (!globalThis.DOMMatrix) (globalThis as any).DOMMatrix = DOMMatrix
if (!globalThis.DOMMatrixReadOnly) (globalThis as any).DOMMatrixReadOnly = DOMMatrixReadOnly
if (!globalThis.DOMPoint) (globalThis as any).DOMPoint = DOMPoint
if (!globalThis.DOMPointReadOnly) (globalThis as any).DOMPointReadOnly = DOMPointReadOnly

if (!globalThis.requestAnimationFrame) {
  ;(globalThis as any).requestAnimationFrame = (cb: Function) => {
    setTimeout(() => cb(0), (1 / 60) * 1000)
  }
}

if (!globalThis.cancelAnimationFrame) {
  ;(globalThis as any).cancelAnimationFrame = () => {}
}
