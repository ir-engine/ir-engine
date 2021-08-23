export default class WEBGL {
  static isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    } catch (e) {
      return false
    }
  }

  static isWebGL2Available() {
    var support = true
    try {
      const canvas = document.createElement('canvas')
      document.body.appendChild(canvas)
      if (canvas.getContext('webgl') == null || canvas.getContext('experimental-webgl') == null) {
        alert('Your brower does not support webgl,or it disable webgl,Please enable webgl')
        return
      }
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
    } catch (e) {
      alert('Your brower does not support webgl,or it disable webgl,Please enable webgl')
      return
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
