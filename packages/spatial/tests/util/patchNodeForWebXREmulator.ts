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
  ;(globalThis as any).requestAnimationFrame = (cb) => {
    setTimeout(() => cb(0), (1 / 60) * 1000)
  }
}

if (!globalThis.cancelAnimationFrame) {
  ;(globalThis as any).cancelAnimationFrame = () => {}
}
