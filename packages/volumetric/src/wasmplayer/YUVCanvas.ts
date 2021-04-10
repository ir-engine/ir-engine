//
//  Copyright (c) 2015 Paperspace Co. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to
//  deal in the Software without restriction, including without limitation the
//  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
//  sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
//  IN THE SOFTWARE.
//

/**
 * This class can be used to render output pictures from an H264bsdDecoder to a canvas element.
 * If available the content is rendered using WebGL.
 */
export default class YUVCanvas {
  private width: number
  private height: number
  private canvasElement: HTMLCanvasElement
  private contextOptions: any
  private type: 'yuv420' | 'yuv422'
  private customYUV444: any
  private conversionType: 'rec601' | 'rec709'
  private animationTime: number
  private contextGL: any
  private shaderProgram: any
  private texturePosBuffer: ArrayBuffer
  private uTexturePosBuffer: ArrayBuffer
  private vTexturePosBuffer: ArrayBuffer
  private yTextureRef: any
  private uTextureRef: any
  private vTextureRef: any
  private textureRef: any

  private drawNextOuptutPictureGL: Function

  constructor(parOptions) {
    parOptions = parOptions || {}

    this.width = parOptions.width || 640
    this.height = parOptions.height || 320

    this.canvasElement = parOptions.canvas || document.createElement('canvas')
    this.contextOptions = parOptions.contextOptions
    this.type = parOptions.type || 'yuv420'

    this.customYUV444 = parOptions.customYUV444
    this.conversionType = parOptions.conversionType || 'rec601'
    this.animationTime = parOptions.animationTime || 0

    this.canvasElement.width = this.width
    this.canvasElement.height = this.height

    this.initContextGL()

    if (this.contextGL) {
      this.initProgram()
      this.initBuffers()
      this.initTextures()
    }

    /**
     * Draw the next output picture using WebGL
     */
    if (this.type === 'yuv420') {
      this.drawNextOuptutPictureGL = function (par) {
        const gl = this.contextGL
        const texturePosBuffer = this.texturePosBuffer
        const uTexturePosBuffer = this.uTexturePosBuffer
        const vTexturePosBuffer = this.vTexturePosBuffer

        const yTextureRef = this.yTextureRef
        const uTextureRef = this.uTextureRef
        const vTextureRef = this.vTextureRef

        const yData = par.yData
        const uData = par.uData
        const vData = par.vData

        const width = this.width
        const height = this.height

        const yDataPerRow = par.yDataPerRow || width
        const yRowCnt = par.yRowCnt || height

        const uDataPerRow = par.uDataPerRow || (width / 2)
        const uRowCnt = par.uRowCnt || (height / 2)

        const vDataPerRow = par.vDataPerRow || uDataPerRow
        const vRowCnt = par.vRowCnt || uRowCnt

        gl.viewport(0, 0, width, height)

        const tTop = 0
        const tLeft = 0
        let tBottom = height / yRowCnt
        let tRight = width / yDataPerRow
        const texturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom])

        gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, texturePosValues, gl.DYNAMIC_DRAW)

        if (this.customYUV444) {
          tBottom = height / uRowCnt
          tRight = width / uDataPerRow
        }
        else {
          tBottom = (height / 2) / uRowCnt
          tRight = (width / 2) / uDataPerRow
        }
        var uTexturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom])

        gl.bindBuffer(gl.ARRAY_BUFFER, uTexturePosBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, uTexturePosValues, gl.DYNAMIC_DRAW)


        if (this.customYUV444) {
          tBottom = height / vRowCnt
          tRight = width / vDataPerRow
        }
        else {
          tBottom = (height / 2) / vRowCnt
          tRight = (width / 2) / vDataPerRow
        }
        var vTexturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom])

        gl.bindBuffer(gl.ARRAY_BUFFER, vTexturePosBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vTexturePosValues, gl.DYNAMIC_DRAW)


        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, yTextureRef)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, yDataPerRow, yRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, yData)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, uTextureRef)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, uDataPerRow, uRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uData)

        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, vTextureRef)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, vDataPerRow, vRowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, vData)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
    else if (this.type === 'yuv422') {
      this.drawNextOuptutPictureGL = function (par) {
        var gl = this.contextGL
        var texturePosBuffer = this.texturePosBuffer

        var textureRef = this.textureRef

        var data = par.data

        var width = this.width
        var height = this.height

        var dataPerRow = par.dataPerRow || (width * 2)
        var rowCnt = par.rowCnt || height

        gl.viewport(0, 0, width, height)

        var tTop = 0
        var tLeft = 0
        var tBottom = height / rowCnt
        var tRight = width / (dataPerRow / 2)
        var texturePosValues = new Float32Array([tRight, tTop, tLeft, tTop, tRight, tBottom, tLeft, tBottom])

        gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, texturePosValues, gl.DYNAMIC_DRAW)

        gl.uniform2f(gl.getUniformLocation(this.shaderProgram, 'resolution'), dataPerRow, height)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textureRef)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dataPerRow, rowCnt, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }

  }

  /**
   * Returns true if the canvas supports WebGL
   */
  isWebGL() {
    return this.contextGL
  }

  /**
   * Create the GL context from the canvas element
   */
  initContextGL() {
    const canvas = this.canvasElement
    let gl

    const validContextNames = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d']
    let nameIndex = 0

    while (!gl && nameIndex < validContextNames.length) {
      const contextName = validContextNames[nameIndex]

      try {
        gl = this.contextOptions
          ? canvas.getContext(contextName, this.contextOptions)
          : canvas.getContext(contextName)
      }
      catch (e) {
        gl = null
      }

      if (!gl || typeof gl.getParameter !== 'function')
        gl = null

      ++nameIndex
    }
    this.contextGL = gl
  }

  /**
   * Initialize GL shader program
   */
  initProgram() {
    const gl = this.contextGL

    // Vertex shader is the same for all types
    var vertexShaderScript
    var fragmentShaderScript

    if (this.type === 'yuv420') {
      vertexShaderScript = `
        attribute vec4 vertexPos;
        attribute vec4 texturePos;
        attribute vec4 uTexturePos;
        attribute vec4 vTexturePos;
        varying vec2 textureCoord;
        varying vec2 uTextureCoord;
        varying vec2 vTextureCoord;

        void main()
        {
          gl_Position = vertexPos;
          textureCoord = texturePos.xy;
          uTextureCoord = uTexturePos.xy;
          vTextureCoord = vTexturePos.xy;
        }`

      fragmentShaderScript = `
        precision highp float;
        varying highp vec2 textureCoord;
        varying highp vec2 uTextureCoord;
        varying highp vec2 vTextureCoord;
        uniform sampler2D ySampler;
        uniform sampler2D uSampler;
        uniform sampler2D vSampler;
        uniform mat4 YUV2RGB;

        void main(void) {
          highp float y = texture2D(ySampler,  textureCoord).r;
          highp float u = texture2D(uSampler,  uTextureCoord).r;
          highp float v = texture2D(vSampler,  vTextureCoord).r;
          gl_FragColor = vec4(y, u, v, 1) * YUV2RGB;
        }`
    }
    else if (this.type === 'yuv422') {
      vertexShaderScript = `
        attribute vec4 vertexPos;
        attribute vec4 texturePos;
        varying vec2 textureCoord;

        void main()
        {
          gl_Position = vertexPos;
          textureCoord = texturePos.xy;
        }`

      fragmentShaderScript = `
        precision highp float;
        varying highp vec2 textureCoord;
        uniform sampler2D sampler;
        uniform highp vec2 resolution;
        uniform mat4 YUV2RGB;

        void main(void) {
          highp float texPixX = 1.0 / resolution.x;
          highp float logPixX = 2.0 / resolution.x;
          highp float logHalfPixX = 4.0 / resolution.x;
          highp float steps = floor(textureCoord.x / logPixX);
          highp float uvSteps = floor(textureCoord.x / logHalfPixX);
          highp float y = texture2D(sampler, vec2((logPixX * steps) + texPixX, textureCoord.y)).r;
          highp float u = texture2D(sampler, vec2((logHalfPixX * uvSteps), textureCoord.y)).r;
          highp float v = texture2D(sampler, vec2((logHalfPixX * uvSteps) + texPixX + texPixX, textureCoord.y)).r;

          // highp float y = texture2D(sampler,  textureCoord).r;
          // gl_FragColor = vec4(y, u, v, 1) * YUV2RGB;

          gl_FragColor = vec4(y, u, v, 1.0) * YUV2RGB;
        }`
    }

    const YUV2RGB = this.conversionType === 'rec709'
      // ITU-T Rec. 709
      ? [
        1.16438, 0.00000, 1.79274, -0.97295,
        1.16438, -0.21325, -0.53291, 0.30148,
        1.16438, 2.11240, 0.00000, -1.13340,
        0, 0, 0, 1,
      ]
      // Assume ITU-T Rec. 601
      : [
        1.16438, 0.00000, 1.59603, -0.87079,
        1.16438, -0.39176, -0.81297, 0.52959,
        1.16438, 2.01723, 0.00000, -1.08139,
        0, 0, 0, 1
      ]

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexShaderScript)
    gl.compileShader(vertexShader)

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
      console.log('Vertex shader failed to compile: ' + gl.getShaderInfoLog(vertexShader))

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, fragmentShaderScript)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
      console.log('Fragment shader failed to compile: ' + gl.getShaderInfoLog(fragmentShader))

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      console.log('Program failed to compile: ' + gl.getProgramInfoLog(program))

    gl.useProgram(program)

    const YUV2RGBRef = gl.getUniformLocation(program, 'YUV2RGB')
    gl.uniformMatrix4fv(YUV2RGBRef, false, YUV2RGB)

    this.shaderProgram = program
  }

  /**
   * Initialize vertex buffers and attach to shader program
   */
  initBuffers() {
    const gl = this.contextGL
    const program = this.shaderProgram

    const vertexPosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW)

    const vertexPosRef = gl.getAttribLocation(program, 'vertexPos')
    gl.enableVertexAttribArray(vertexPosRef)
    gl.vertexAttribPointer(vertexPosRef, 2, gl.FLOAT, false, 0, 0)

    if (this.animationTime) {
      const animationTime = this.animationTime
      const stepTime = 15
      let timePassed = 0

      const aniFun = function () {
        timePassed += stepTime
        let mul = (1 * timePassed) / animationTime

        if (timePassed >= animationTime)
          mul = 1
        else
          setTimeout(aniFun, stepTime)

        var neg = -1 * mul
        var pos = 1 * mul

        var vertexPosBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([pos, pos, neg, pos, pos, neg, neg, neg]), gl.STATIC_DRAW)

        var vertexPosRef = gl.getAttribLocation(program, 'vertexPos')
        gl.enableVertexAttribArray(vertexPosRef)
        gl.vertexAttribPointer(vertexPosRef, 2, gl.FLOAT, false, 0, 0)

        try {
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
        catch (e) { }
      }
      aniFun()
    }

    const texturePosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW)

    const texturePosRef = gl.getAttribLocation(program, 'texturePos')
    gl.enableVertexAttribArray(texturePosRef)
    gl.vertexAttribPointer(texturePosRef, 2, gl.FLOAT, false, 0, 0)

    this.texturePosBuffer = texturePosBuffer

    if (this.type === 'yuv420') {
      const uTexturePosBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, uTexturePosBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW)

      const uTexturePosRef = gl.getAttribLocation(program, 'uTexturePos')
      gl.enableVertexAttribArray(uTexturePosRef)
      gl.vertexAttribPointer(uTexturePosRef, 2, gl.FLOAT, false, 0, 0)

      this.uTexturePosBuffer = uTexturePosBuffer

      const vTexturePosBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vTexturePosBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 0, 0, 0, 1, 1, 0, 1]), gl.STATIC_DRAW)

      const vTexturePosRef = gl.getAttribLocation(program, 'vTexturePos')
      gl.enableVertexAttribArray(vTexturePosRef)
      gl.vertexAttribPointer(vTexturePosRef, 2, gl.FLOAT, false, 0, 0)

      this.vTexturePosBuffer = vTexturePosBuffer
    }
  }

  /**
   * Initialize GL textures and attach to shader program
   */
  initTextures() {
    const gl = this.contextGL
    const program = this.shaderProgram

    if (this.type === 'yuv420') {
      const yTextureRef = this.initTexture()
      const ySamplerRef = gl.getUniformLocation(program, 'ySampler')
      gl.uniform1i(ySamplerRef, 0)
      this.yTextureRef = yTextureRef

      const uTextureRef = this.initTexture()
      const uSamplerRef = gl.getUniformLocation(program, 'uSampler')
      gl.uniform1i(uSamplerRef, 1)
      this.uTextureRef = uTextureRef

      const vTextureRef = this.initTexture()
      const vSamplerRef = gl.getUniformLocation(program, 'vSampler')
      gl.uniform1i(vSamplerRef, 2)
      this.vTextureRef = vTextureRef
    }
    else if (this.type === 'yuv422') {
      // Only one texture for 422
      var textureRef = this.initTexture()
      var samplerRef = gl.getUniformLocation(program, 'sampler')
      gl.uniform1i(samplerRef, 0)
      this.textureRef = textureRef
    }
  }

  /**
   * Create and configure a single texture
   */
  initTexture() {
    const gl = this.contextGL
    const textureRef = gl.createTexture()

    gl.bindTexture(gl.TEXTURE_2D, textureRef)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindTexture(gl.TEXTURE_2D, null)

    return textureRef
  }

  /**
   * Draw picture data to the canvas.
   * If this object is using WebGL, the data must be an I420 formatted ArrayBuffer,
   * Otherwise, data must be an RGBA formatted ArrayBuffer.
   */
  drawNextOutputPicture(width, height, croppingParams, data) {
    if (this.contextGL)
      this.drawNextOuptutPictureGL(width, height, croppingParams, data)
    else
      this.drawNextOuptutPictureRGBA(width, height, croppingParams, data)
  }



  /**
   * Draw next output picture using ARGB data on a 2d canvas.
   */
  drawNextOuptutPictureRGBA(width, height, croppingParams = null, data) {
    const canvas = this.canvasElement
    const argbData = data

    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, width, height)
    imageData.data.set(argbData)

    if (croppingParams === null)
      ctx.putImageData(imageData, 0, 0)
    else
      ctx.putImageData(imageData, -croppingParams.left, -croppingParams.top, 0, 0, croppingParams.width, croppingParams.height)
  }
}
