import { WebRenderer } from '../WebRenderer'
import { generateEmbeddedCSS } from './generateEmbeddedCSS'

/**
 * Generate and returns a dataurl for the given url
 */
export async function getEmbeddedDataURL(url: string, accept?: string): Promise<string> {
  if (url.startsWith('data')) return url
  if (WebRenderer.dataURLMap.has(url)) return WebRenderer.dataURLMap.get(url)!
  const dataURLPromise = new Promise<string>(async (resolveDataURL) => {
    const res = await fetch(url, accept ? { headers: { accept } } : undefined)
    const contentType = res.headers.get('content-type')
    if (contentType == 'text/css') {
      const css = await generateEmbeddedCSS(url, await res.text())
      WebRenderer.embeddedCSSMap.set(url, css)
      resolveDataURL('data:' + contentType + ';base64,' + window.btoa(css))
    } else {
      const buffer = new Uint8Array(await res.arrayBuffer())
      resolveDataURL('data:' + contentType + ';base64,' + WebRenderer.arrayBufferToBase64(buffer))
    }
  })
  WebRenderer.dataURLMap.set(url, dataURLPromise)
  return dataURLPromise
}
