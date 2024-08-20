/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

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
