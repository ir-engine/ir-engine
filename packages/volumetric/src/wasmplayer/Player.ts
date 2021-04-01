/*
Usage:

p = new Player({
  useWorker: <bool>,
  workerFile: <defaults to "Decoder.js"> // give path to Decoder.js
  webgl: true | false | "auto" // defaults to "auto"
})

// canvas property represents the canvas node
// put it somewhere in the dom
p.canvas

p.webgl // contains the used rendering mode. if you pass auto to webgl you can see what auto detection resulted in

p.decode(<binary>)
*/

import WebGLCanvas from './YUVCanvas'

type PlayerOptions = {
  webgl?: boolean
  render?: boolean
  size?: {
    width: number
    height: number
  }
  workerFile?: any
  reuseMemory?: boolean
  transferMemory?: boolean
  contextOptions?: any
  preserveDrawingBuffer?: boolean
}

export default class Player {
  private options: PlayerOptions
  public render: any
  public webgl: boolean | 'auto'

  public createCanvasObj: Function
  public renderFrame: Function
  public onRenderFrameComplete: Function
  public canvas: any
  public canvasObj: any
  public domNode: any

  public decoder: any
  public decode: Function
  public memsize: any
  public worker: any

  constructor(options: PlayerOptions) {
    this.options = options || {}

    this.render = true
    if (this.options.render === false)
      this.render = false

    this.options.workerFile = this.options.workerFile || 'Decoder.js'

    if (this.options.preserveDrawingBuffer) {
      this.options.contextOptions = this.options.contextOptions || {}
      this.options.contextOptions.preserveDrawingBuffer = true
    }

    let webgl: 'auto' | boolean = 'auto'

    if (this.options.webgl === true)
      webgl = true
    else if (this.options.webgl === false)
      webgl = false

    if (webgl === 'auto') {
      webgl = true

      try {
        // Browser doesn't even know what WebGL is
        if (!(window as any).WebGLRenderingContext) {
          webgl = false
        }
        else {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext("webgl")

          // Browser supports WebGL but initialization failed
          if (!ctx)
            webgl = false
        }
      }
      catch (e) {
        webgl = false
      }
    }

    this.webgl = webgl

    if (this.webgl) {
      this.createCanvasObj = this.createCanvasWebGL
      this.renderFrame = this.renderFrameWebGL
    }
    else {
      this.createCanvasObj = this.createCanvasRGB
      this.renderFrame = this.renderFrameRGB
    }

    let lastWidth
    let lastHeight

    const onPictureDecoded = (buffer: any, width: number, height: number, infos: any) => {
      this.onPictureDecoded(buffer, width, height, infos)

      if (!buffer || !this.render)
        return

      this.renderFrame({
        canvasObj: this.canvasObj,
        data: buffer,
        width: width,
        height: height
      })

      if (this.onRenderFrameComplete) {
        this.onRenderFrameComplete({
          data: buffer,
          width: width,
          height: height,
          infos: infos,
          canvasObj: this.canvasObj
        })
      }

    }

    // provide size

    if (!this.options.size)
      this.options.size = {
        width: this.options.size.width || 200,
        height: this.options.size.height || 200
      }

      this.worker = new Worker(this.options.workerFile)

      this.worker.addEventListener('message', function (e) {
        const data = e.data
        if (data.consoleLog) {
          console.log(data.consoleLog)
          return
        }

        onPictureDecoded(new Uint8Array(data.buf, 0, data.length), data.width, data.height, data.infos)
      }, false)

      this.worker.postMessage({
        type: 'Broadway.js - Worker init',
        options: {
          rgb: !webgl,
          memsize: this.memsize,
          reuseMemory: !!this.options.reuseMemory
        }
      })

      if (this.options.transferMemory) {
        this.decode = function (parData, parInfo) {
          // no copy
          // instead we are transfering the ownership of the buffer
          // dangerous!!!

          this.worker.postMessage({ buf: parData.buffer, offset: parData.byteOffset, length: parData.length, info: parInfo }, [parData.buffer]); // Send data to our worker.
        }
      }
      else {
        this.decode = function (parData, parInfo) {
          // Copy the sample so that we only do a structured clone of the region of interest
          const copyU8 = new Uint8Array(parData.length)
          // copyU8.set(parData, 0, parData.length)
          copyU8.set(parData, 0)
          this.worker.postMessage({ buf: copyU8.buffer, offset: 0, length: parData.length, info: parInfo }, [copyU8.buffer]); // Send data to our worker.
        }

      }

      if (this.options.reuseMemory) {
        this.recycleMemory = (parArray) => {
          //this.beforeRecycle()
          this.worker.postMessage({ reuse: parArray.buffer }, [parArray.buffer]); // Send data to our worker.
          //this.afterRecycle()
        }
      }
    

    if (this.render) {
      this.canvasObj = this.createCanvasObj({
        contextOptions: this.options.contextOptions
      })
      this.canvas = this.canvasObj.canvas
    }

    this.domNode = this.canvas

    lastWidth = this.options.size.width
    lastHeight = this.options.size.height
  }

  onPictureDecoded(buffer: any, width: number, height: number, infos: any) {
    buffer
    width
    height
    infos
  }

  // Called when memory of decoded frames is not used anymore
  recycleMemory(buf) {
    buf
  }
  /*beforeRecycle: function(){},
  afterRecycle: function(){},*/

  // For both functions options is:
  //
  //  width
  //  height
  //  enableScreenshot
  //
  // returns a object that has a property canvas which is a html5 canvas
  createCanvasWebGL(options) {
    var canvasObj = this._createBasicCanvasObj(options)
    canvasObj.contextOptions = options.contextOptions
    return canvasObj
  }

  createCanvasRGB(options) {
    var canvasObj = this._createBasicCanvasObj(options)
    return canvasObj
  }

  // Same for webGL and RGB
  _createBasicCanvasObj(options) {
    options = options || {}

    const obj: any = {}
    const width = options.width || this.options.size.width
    const height = options.height || this.options.size.height

    obj.canvas = document.createElement('canvas')
    obj.canvas.width = width
    obj.canvas.height = height
    obj.canvas.style.backgroundColor = "#0D0E1B"

    return obj
  }

  // options:
  //
  // canvas
  // data
  renderFrameWebGL(options) {
    const canvasObj = options.canvasObj

    const width = options.width || canvasObj.canvas.width
    const height = options.height || canvasObj.canvas.height

    if (canvasObj.canvas.width !== width || canvasObj.canvas.height !== height || !canvasObj.webGLCanvas) {
      canvasObj.canvas.width = width
      canvasObj.canvas.height = height
      canvasObj.webGLCanvas = new WebGLCanvas({
        canvas: canvasObj.canvas,
        contextOptions: canvasObj.contextOptions,
        width: width,
        height: height
      })
    }

    const ylen = width * height
    const uvlen = (width / 2) * (height / 2)

    canvasObj.webGLCanvas.drawNextOutputPicture({
      yData: options.data.subarray(0, ylen),
      uData: options.data.subarray(ylen, ylen + uvlen),
      vData: options.data.subarray(ylen + uvlen, ylen + uvlen + uvlen)
    })

    this.recycleMemory(options.data)
  }

  renderFrameRGB(options: any) {
    const canvasObj = options.canvasObj

    const width = options.width || canvasObj.canvas.width
    const height = options.height || canvasObj.canvas.height

    if (canvasObj.canvas.width !== width || canvasObj.canvas.height !== height) {
      canvasObj.canvas.width = width
      canvasObj.canvas.height = height
    }

    let ctx = canvasObj.ctx
    let imgData = canvasObj.imgData

    if (!ctx) {
      canvasObj.ctx = canvasObj.canvas.getContext('2d')
      ctx = canvasObj.ctx

      canvasObj.imgData = ctx.createImageData(width, height)
      imgData = canvasObj.imgData
    }

    imgData.data.set(options.data)
    ctx.putImageData(imgData, 0, 0)
    this.recycleMemory(options.data)
  }
}
