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

import { isClient } from './common/functions/getEnvironment'

if (!isClient) {
  const { Blob } = require('buffer')
  const fetch = require('node-fetch')

  globalThis.fetch = fetch
  globalThis.Request = fetch.Request
  globalThis.Response = fetch.Response
  globalThis.Headers = fetch.Headers
  globalThis.self = globalThis as Window & typeof globalThis

  // this will be added in node 19
  if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = (blob) => null!
  if (!globalThis.Blob) globalThis.Blob = Blob

  const _localStorage = {}
  if (!globalThis.localStorage)
    globalThis.localStorage = {
      setItem: (key, val) => {
        _localStorage[key] = val
      },
      getItem: (key) => {
        return _localStorage[key] ?? null
      }
    } as Storage

  // patches for headless-gl - currently unused

  // patch navigator
  if (!globalThis.navigator)
    (globalThis as any).navigator = {
      product: 'NativeScript', // patch axios so it doesnt complain,
      userAgent: 'node'
    }
  /*
  
  // todo: move this out of module scope
  function addEventListener(event, func, bind_) {}
  
  // patch window prop for three
  if (!globalThis.window) (globalThis as any).window = {}
  Object.assign((globalThis as any).window, {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener,
    URL
  })
  
  class Image {}
  
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
    URL,
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
  */
}
