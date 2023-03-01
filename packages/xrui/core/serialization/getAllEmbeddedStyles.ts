import { bufferToHex } from '../hex-utils'
import { WebRenderer } from '../WebRenderer'
import { generateEmbeddedCSS, getEmbeddedCSS } from './generateEmbeddedCSS'

export async function getAllEmbeddedStyles(el: Element) {
  const rootNode = el.getRootNode() as ShadowRoot | Document
  const embedded = WebRenderer.embeddedStyles

  const styleElements = Array.from(
    rootNode.querySelectorAll("style, link[type='text/css'], link[rel='stylesheet']")
  ) as (HTMLStyleElement | HTMLLinkElement)[]

  const inShadow = el.getRootNode() instanceof ShadowRoot

  const elementData = [] as Array<Promise<{ serialized: string; hash: string }>>

  for (const element of styleElements) {
    if (!embedded.has(element)) {
      // foundNewStyles = true
      embedded.set(
        element,
        new Promise<string>((resolve) => {
          if (element.tagName.toLowerCase() === 'style') {
            resolve(generateEmbeddedCSS(window.location.href, element.textContent || ''))
          } else {
            const link = element as HTMLLinkElement
            resolve(getEmbeddedCSS(link.href))
          }
        }).then(async (cssText) => {
          const regEx = RegExp(/@font-face[^{]*{([^{}]|{[^{}]*})*}/gi)
          const fontRules = cssText.match(regEx)

          // if we are inside shadow dom, we have to clone the fonts
          // into the light dom to load fonts in Chrome/Firefox
          if (inShadow && fontRules) {
            for (const rule of fontRules) {
              if (WebRenderer.fontStyles.has(rule)) continue
              const fontStyle = document.createElement('style')
              fontStyle.innerHTML = rule
              document.head.appendChild(fontStyle)
              WebRenderer.fontStyles.set(rule, fontStyle)
              embedded.set(fontStyle, Promise.resolve({ serialized: '', hash: '' }))
            }
          }

          const hashBuffer = await crypto.subtle.digest('SHA-1', WebRenderer.textEncoder.encode(cssText))
          return { serialized: cssText, hash: bufferToHex(hashBuffer) }
        })
      )
    }
    elementData.push(embedded.get(element)!)
  }

  return Promise.all(elementData)
}
