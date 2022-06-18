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
}
