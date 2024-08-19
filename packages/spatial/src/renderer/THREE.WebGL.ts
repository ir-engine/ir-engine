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

export default class WEBGL {
  static isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    } catch (e) {
      return false
    }
  }

  static isWebGL2Available(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
    } catch (e) {
      return false
    }
  }

  static getWebGLErrorMessage() {
    return this.getErrorMessage(1)
  }

  static getWebGL2ErrorMessage() {
    return this.getErrorMessage(2)
  }

  static getErrorMessage(version) {
    const names = {
      1: 'WebGL',
      2: 'WebGL 2'
    }

    const contexts = {
      1: window.WebGLRenderingContext,
      2: window.WebGL2RenderingContext
    }

    let message =
      'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>'

    const element = document.createElement('div')
    element.id = 'webglmessage'
    element.style.fontFamily = 'monospace'
    element.style.fontSize = '13px'
    element.style.fontWeight = 'normal'
    element.style.textAlign = 'center'
    element.style.background = '#fff'
    element.style.color = '#000'
    element.style.padding = '1.5em'
    element.style.width = '400px'
    element.style.margin = '5em auto 0'

    if (contexts[version]) {
      message = message.replace('$0', 'graphics card')
    } else {
      message = message.replace('$0', 'browser')
    }

    message = message.replace('$1', names[version])

    element.innerHTML = message

    return element
  }
}
