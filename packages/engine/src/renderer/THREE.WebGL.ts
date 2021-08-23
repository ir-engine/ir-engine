export default class WEBGL {
  static isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    } catch (e) {
      return false
    }
  }

  static create3DContext(canvas) {
    var names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl']
    var context = null
    for (var ii = 0; ii < names.length; ++ii) {
      try {
        context = canvas.getContext(names[ii])
      } catch (e) {}
      if (context) {
        break
      }
    }
    return context
  }

  static isWebGL2Available() {
    var support = true

    try {
      var $canvas = $('<canvas />')
      $('body').append($canvas)
      var canvas = $canvas[0]

      if (canvas.addEventListener) {
        canvas.addEventListener(
          'webglcontextcreationerror',
          function (event) {
            support = false
          },
          false
        )
      }

      var context = create3DContext(canvas)
      if (!context) {
        if (!window.WebGLRenderingContext) {
          console.log('No WebGLRenderingContext')
        }

        support = false
      }
    } catch (e) {
      alert('Your brower does not support webgl,or it disable webgl,Please enable webgl')
      return
    } finally {
      canvas.remove()
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
