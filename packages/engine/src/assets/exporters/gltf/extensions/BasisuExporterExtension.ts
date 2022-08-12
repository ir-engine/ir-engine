import { KTX2Encoder } from '@etherealjs/web-layer/core/textures/KTX2Encoder'
import { CompressedTexture, DataTexture, PixelFormat, Texture, Vector2, WebGLRenderTarget } from 'three'

import { EngineRenderer } from '../../../../renderer/WebGLRendererSystem'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class BasisuExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer, {})
    this.name = 'KHR_texture_basisu'
    this.sampler = writer.processSampler(new Texture())
    this.imgCache = new Map<any, number>()
  }

  imgCache: Map<any, number>
  sampler: any

  writeTexture(texture: CompressedTexture, textureDef) {
    if (!texture.isCompressedTexture) return
    const writer = this.writer
    const img = texture.mipmaps[0]
    const srcId = texture.source.uuid
    if (this.imgCache.has(srcId)) {
      console.log('found cached image')
      const index = this.imgCache.get(srcId)!
      textureDef.extensions = textureDef.extensions ?? {}
      textureDef.extensions[this.name] = { source: index }
      textureDef.sampler = this.sampler
      return
    }
    console.log('cache miss for uuid ' + srcId)
    const ktx2write = new KTX2Encoder()
    const imageDef: any = {
      width: img.width,
      height: img.height,
      mimeType: 'image/ktx2'
    }
    if (!writer.json.images) writer.json.images = []
    const index = writer.json.images.push(imageDef) - 1
    this.imgCache.set(srcId, index)
    writer.pending.push(
      new Promise((resolve) => {
        ktx2write.encode({ width: img.width, height: img.height, data: new Uint8Array(img.data) }).then((arrayBuf) => {
          const blob = new Blob([arrayBuf])
          writer
            .processBufferViewImage(blob)
            .then((source) => {
              imageDef.bufferView = source
              writer.extensionsUsed[this.name] = true
              textureDef.extensions = textureDef.extensions ?? {}
              textureDef.extensions[this.name] = { source: index }
              textureDef.sampler = this.sampler
            })
            .then(resolve)
        })
      })
    )
  }
}
