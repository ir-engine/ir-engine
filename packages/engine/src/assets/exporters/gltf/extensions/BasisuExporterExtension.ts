import { KTX2Encoder } from '@etherealjs/web-layer/core/textures/KTX2Encoder'
import { CompressedTexture, DataTexture, PixelFormat, Vector2, WebGLRenderTarget } from 'three'

import { EngineRenderer } from '../../../../renderer/WebGLRendererSystem'
import { ExporterExtension } from './ExporterExtension'

export default class BasisuExporterExtension extends ExporterExtension {
  constructor(writer) {
    super(writer, {})
    this.name = 'KHR_texture_basisu'
  }

  writeTexture(texture: CompressedTexture, textureDef) {
    if (!texture.isCompressedTexture) return
    const writer = this.writer
    const img = texture.mipmaps[0]
    const ktx2write = new KTX2Encoder()
    const imageDef: any = {
      width: img.width,
      height: img.height,
      mimeType: 'image/ktx2'
    }
    const dataBuf = Uint8Array.from(img.data)
    writer.pending.push(
      new Promise((resolve) =>
        ktx2write
          .encode({ width: img.width, height: img.height, data: dataBuf })
          .then((arrayBuf) => {
            const blob = new Blob([arrayBuf])
            return writer.processBufferViewImage(blob)
          })
          .then((source) => {
            if (!writer.json.images) writer.json.images = []
            imageDef.bufferView = source
            const index = writer.json.images.push(imageDef) - 1
            writer.extensionsUsed[this.name] = true
            textureDef.extensions = textureDef.extensions ?? {}
            textureDef.extensions[this.name] = { source: index }
            textureDef.sampler = writer.processSampler(texture)
          })
          .then(resolve)
      )
    )
  }
}
