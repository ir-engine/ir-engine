import { JSDOM } from 'jsdom'

export const createDOM = () => {
  const dom = new JSDOM(
    `<html>
        <body>
        </body>
    </html>`,
    { url: 'http://localhost' }
  )
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.Image = dom.window.Image

  if (typeof globalThis.window.CustomEvent === 'function') return false
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null }
    const evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }
  ;(globalThis.window as any).CustomEvent = CustomEvent
}
