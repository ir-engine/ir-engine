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

import { compress } from 'fflate'
// import { Packr, Unpackr } from 'msgpackr'
import { Matrix4 } from 'three'

import { getBorder, getBounds, getMargin, getPadding, parseCSSTransform } from './dom-utils'
import { bufferToHex } from './hex-utils'
import { getParentsHTML, serializeToString } from './serialization-utils'
import { getAllEmbeddedStyles } from './serialization/getAllEmbeddedStyles'
import { KTX2Encoder, UASTCFlags } from './textures/KTX2Encoder'
import { WebLayer } from './WebLayer'
import { WebRenderer } from './WebRenderer'
import { StateHash, TextureHash, XRUILayerState } from './XRUILayerState'

const scratchMatrix = new Matrix4()

// import * as zip from '@zip.js/zip.js'
// const zipBaseURI = 'https://unpkg.com/@zip.js/zip.js@2.4.4/dist/'

function nearestPowerOf2(n: number) {
  return 1 << (31 - Math.clz32(n))
}

function nextPowerOf2(n: number) {
  return nearestPowerOf2((n - 1) * 2)
}

export class WebLayerManagerBase {
  MINIMUM_RENDER_ATTEMPTS = 3

  MAX_SERIALIZE_TASK_COUNT = 10
  MAX_RASTERIZE_TASK_COUNT = 5

  tasksPending = false
  serializePendingCount = 0
  rasterizePendingCount = 0

  WebRenderer = WebRenderer

  autosave = true
  autosaveDelay = 10 * 1000
  _autosaveTimer?: any

  pixelsPerMeter = 1000

  /**
   * @deprecated
   */
  get pixelPerUnit() {
    return this.pixelsPerMeter
  }

  serializeQueue = [] as {
    layer: WebLayer
    // element?: HTMLElement;
    resolve: (val: any) => void
    promise: any
  }[]
  rasterizeQueue = [] as {
    hash: StateHash
    svgUrl: string
    // layer?: WebLayer
    // char?: string
    resolve: (val: any) => void
    promise: any
  }[]
  optimizeQueue = [] as { textureHash: TextureHash; resolve: (val: any) => void; promise: any }[]

  ktx2Encoder = new KTX2Encoder()

  async compressTexture(textureHash: TextureHash) {
    const data = this._textureData.get(textureHash)
    const canvas = data?.canvas
    if (!canvas) throw new Error('Missing texture canvas')
    if (this.ktx2Encoder.pool.limit === 0) return

    const image = this.getImageData(canvas)
    let ktx2Texture: ArrayBuffer
    try {
      ktx2Texture = await this.ktx2Encoder.encode(image, {
        srgb: true,
        // compressionLevel: 0,
        // qualityLevel: 256
        uastc: true,
        uastcFlags: UASTCFlags.UASTCLevelFastest
      })
    } catch (error: any) {
      console.error(`KTX2 encoding failed for image (${canvas.width}, ${canvas.height}) `, error)
      this.ktx2Encoder.pool.dispose()
      return
    }

    const textureData: TextureStoreData = this._unsavedTextureData.get(textureHash) || {
      hash: textureHash,
      timestamp: Date.now(),
      texture: undefined
    }
    data.ktx2Url = URL.createObjectURL(new Blob([ktx2Texture], { type: 'image/ktx2' }))
    const bufferData = await new Promise<Uint8Array>((resolve, reject) => {
      compress(new Uint8Array(ktx2Texture), { consume: true }, (err, bufferData) => {
        if (err) return reject(err)
        resolve(bufferData)
      })
    })
    textureData.texture = bufferData
    this._unsavedTextureData.set(textureHash, textureData)
  }

  scheduleTasksIfNeeded() {
    if (this.tasksPending || (this.serializeQueue.length === 0 && this.rasterizeQueue.length === 0)) return
    this.tasksPending = true
    setTimeout(this._runTasks, 1)
  }

  private _runTasks = () => {
    const serializeQueue = this.serializeQueue
    const rasterizeQueue = this.rasterizeQueue

    // console.log("serialize task size", serializeQueue.length, serializeQueue)
    // console.log("rasterize task size", rasterizeQueue.length, rasterizeQueue)

    while (serializeQueue.length > 0 && this.serializePendingCount < this.MAX_SERIALIZE_TASK_COUNT) {
      this.serializePendingCount++
      const { layer, resolve } = serializeQueue.shift()!
      this.serialize(layer).then((val) => {
        this.serializePendingCount--
        resolve(val)
      })
    }

    while (rasterizeQueue.length > 0 && this.rasterizePendingCount < this.MAX_RASTERIZE_TASK_COUNT) {
      this.rasterizePendingCount++
      const { hash, svgUrl: url, resolve } = rasterizeQueue.shift()!
      this.rasterize(hash, url).finally(() => {
        this.rasterizePendingCount--
        resolve(undefined)
        if (this._autosaveTimer) clearTimeout(this._autosaveTimer)
        if (this.autosave && this._unsavedTextureData.size)
          this._autosaveTimer = setTimeout(() => {
            XRUILayerState.saveStore()
          }, this.autosaveDelay / this._unsavedTextureData.size)
      })
    }

    this.tasksPending = false
  }

  addToSerializeQueue(layer: WebLayer): ReturnType<typeof WebLayerManagerBase.prototype.serialize> {
    const inQueue = this.serializeQueue.find((v) => v.layer === layer)
    if (inQueue) return inQueue.promise
    let resolve!: (v: any) => any
    const promise = new Promise((r) => {
      resolve = r
    })
    this.serializeQueue.push({ layer, resolve, promise })
    return promise as Promise<any>
  }

  updateDOMMetrics(layer: WebLayer) {
    const metrics = layer.domMetrics
    getBounds(layer.element, metrics.bounds, layer.parentLayer?.element)
    getMargin(layer.element, metrics.margin)
    getPadding(layer.element, metrics.padding)
    getBorder(layer.element, metrics.border)
  }

  async serialize(layer: WebLayer) {
    this.updateDOMMetrics(layer)
    const layerElement = layer.element as HTMLElement
    // if (element) layerElement.textContent = element.textContent
    const metrics = layer.domMetrics

    const { top, left, width, height } = metrics.bounds
    const { top: marginTop, left: marginLeft, bottom: marginBottom, right: marginRight } = metrics.margin
    // add margins
    const fullWidth = width + Math.max(marginLeft, 0) + Math.max(marginRight, 0)
    const fullHeight = height + Math.max(marginTop, 0) + Math.max(marginBottom, 0)

    const pixelRatio = layer.computedPixelRatio
    const textureWidth = Math.max(nextPowerOf2(fullWidth * pixelRatio), 32)
    const textureHeight = Math.max(nextPowerOf2(fullHeight * pixelRatio), 32)

    const result = {} as { stateKey: StateHash | HTMLMediaElement; svgUrl?: string; needsRasterize: boolean }
    let svgDoc!: string

    const computedStyle = getComputedStyle(layerElement)

    const transform = computedStyle.transform
    let cssTransform = null as Matrix4 | null
    if (transform && transform !== 'none') {
      const pixelSize = 1 / this.pixelsPerMeter
      cssTransform = parseCSSTransform(computedStyle, width, height, pixelSize, scratchMatrix)
    }

    if (layer.isMediaElement) {
      result.stateKey = layerElement as HTMLMediaElement
    } else {
      // create svg markup
      const layerAttribute = WebRenderer.attributeHTML(WebRenderer.LAYER_ATTRIBUTE, '')
      const needsInlineBlock = computedStyle.display === 'inline'
      WebRenderer.updateInputAttributes(layerElement)

      const parentsHTML = getParentsHTML(layer, fullWidth, fullHeight, textureWidth, textureHeight)
      const svgCSS = await getAllEmbeddedStyles(layerElement)
      let layerHTML = await serializeToString(layerElement)
      layerHTML = layerHTML.replace(
        layerAttribute,
        `${layerAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
          `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
          WebRenderer.getPsuedoAttributes(layer.desiredPseudoState)
      )

      const hashComponents = [...svgCSS.map((s) => s.hash), parentsHTML[0], layerHTML, parentsHTML[1]].join('\n')

      // @ts-ignore
      const stateHashBuffer = await crypto.subtle.digest('SHA-1', WebRenderer.textEncoder.encode(hashComponents))
      const stateHash =
        bufferToHex(stateHashBuffer) +
        '?w=' +
        fullWidth +
        ';h=' +
        fullHeight +
        ';tw=' +
        textureWidth +
        ';th=' +
        textureHeight
      result.stateKey = stateHash

      svgDoc =
        '<svg width="' +
        textureWidth +
        '" height="' +
        textureHeight +
        '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[\n' +
        svgCSS.map((s) => s.serialized).join('\n') +
        ']]></style></defs><foreignObject x="0" y="0" width="' +
        textureWidth +
        '" height="' +
        textureHeight +
        '">' +
        parentsHTML[0] +
        layerHTML +
        parentsHTML[1] +
        '</foreignObject></svg>'
    }

    // update the layer state data
    const data = await XRUILayerState.requestStoredData(result.stateKey)
    data.cssTransform = cssTransform?.clone()
    data.bounds.left = left
    data.bounds.top = top
    data.bounds.width = width
    data.bounds.height = height
    data.margin.left = marginLeft
    data.margin.top = marginTop
    data.margin.right = marginRight
    data.margin.bottom = marginBottom
    data.fullWidth = fullWidth
    data.fullHeight = fullHeight
    data.pixelRatio = pixelRatio
    data.textureWidth = textureWidth
    data.textureHeight = textureHeight

    layer.desiredDOMStateKey = result.stateKey
    if (typeof result.stateKey === 'string') layer.allStateHashes.add(result.stateKey)

    result.needsRasterize = !layer.isMediaElement && fullWidth * fullHeight > 0 && !data.texture?.hash
    result.svgUrl =
      result.needsRasterize && svgDoc ? 'data:image/svg+xml;utf8,' + encodeURIComponent(svgDoc) : undefined
    layer.lastSVGUrl = result.svgUrl

    return result
  }

  async rasterize(stateHash: StateHash, svgUrl: SVGUrl) {
    const stateData = this.getLayerState(stateHash)
    const svgImage = this._imagePool.pop() || new Image()

    const { fullWidth, fullHeight, textureWidth, textureHeight, pixelRatio } = stateData

    await new Promise<void>((resolve, reject) => {
      svgImage.onload = () => {
        resolve()
      }

      svgImage.onerror = (error) => {
        reject(error)
      }

      svgImage.width = textureWidth
      svgImage.height = textureHeight
      svgImage.src = svgUrl
    })

    if (!svgImage.complete || svgImage.currentSrc !== svgUrl) {
      throw new Error('Rasterization Failed')
    }

    await svgImage.decode()

    const sourceWidth = fullWidth * pixelRatio
    const sourceHeight = fullHeight * pixelRatio

    const hashCanvas = await this.rasterizeToCanvas(svgImage, sourceWidth, sourceHeight, 30, 30)
    const hashData = this.getImageData(hashCanvas)
    const textureHashBuffer = await crypto.subtle.digest('SHA-1', hashData.data)
    const textureHash = bufferToHex(textureHashBuffer) + '?w=' + textureWidth + ';h=' + textureHeight

    const previousCanvasHash = stateData.texture?.hash
    // stateData.texture.hash = textureHash

    if (previousCanvasHash !== textureHash) {
      stateData.renderAttempts = 0
    }

    stateData.renderAttempts++

    stateData.texture = this.getTextureState(textureHash)
    const hasTexture = stateData.texture.canvas || stateData.texture.ktx2Url
    if (stateData.renderAttempts > this.MINIMUM_RENDER_ATTEMPTS && hasTexture) {
      return
    }

    // if (layer && char) {
    //   layer.prerasterizedImages.set(char, stateData.texture.hash)
    // }

    // in case the svg image wasn't finished loading, we should try again a few times
    setTimeout(() => this.addToRasterizeQueue(stateHash, svgUrl), ((500 + 0.1 * 1000) * 2) ^ stateData.renderAttempts)

    if (stateData.texture.canvas) return

    stateData.texture.canvas = await this.rasterizeToCanvas(
      svgImage,
      sourceWidth,
      sourceHeight,
      textureWidth,
      textureHeight
    )

    try {
      await this.compressTexture(textureHash)
    } finally {
      this._imagePool.push(svgImage)
    }
  }

  prerasterized = false

  async rasterizeToCanvas(
    svgImage: HTMLImageElement,
    sourceWidth: number,
    sourceHeight: number,
    textureWidth: number,
    textureHeight: number,
    canvas?: HTMLCanvasElement
  ): Promise<HTMLCanvasElement> {
    canvas = canvas || document.createElement('canvas')
    canvas.width = textureWidth
    canvas.height = textureHeight
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // createImageBitmap non-blocking api would be nice, but causes chrome to taint the canvas,
    // and Safari treats the svg size strangely
    // const imageBitmap = await createImageBitmap(svgImage, 0,0, sourceWidth * devicePixelRatio, sourceHeight * devicePixelRatio, {
    //     resizeWidth: textureWidth,
    //     resizeHeight: textureHeight,
    //     resizeQuality: 'high'
    // })
    // ctx.drawImage(imageBitmap, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight)
    ctx.drawImage(svgImage, 0, 0, textureWidth, textureHeight)

    return canvas
  }

  getImageData(canvas: HTMLCanvasElement): ImageData {
    return canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height)
  }

  addToRasterizeQueue(hash: StateHash, url: string): ReturnType<typeof WebLayerManagerBase.prototype.rasterize> {
    const inQueue = this.rasterizeQueue.find((v) => v.hash === hash)
    if (inQueue) return inQueue.promise
    let resolve!: (v: any) => any
    const promise = new Promise((r) => {
      resolve = r
    })
    this.rasterizeQueue.push({ hash, svgUrl: url, resolve, promise })
    return promise as Promise<void>
  }

  optimizeImageData(stateHash: StateHash) {}

  addToOptimizeQueue(hash: StateHash) {}
}
