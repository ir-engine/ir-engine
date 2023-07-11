/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
