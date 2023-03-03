import { ImageDataType } from '@loaders.gl/images'
import { CompressedTexture, Texture } from 'three'

import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

import createReadableTexture from '../../../functions/createReadableTexture'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class BasisuExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'KHR_texture_basisu'
    this.sampler = writer.processSampler(new Texture())
  }

  sampler: number

  writeTexture(_texture: CompressedTexture, textureDef) {
    if (!_texture.isCompressedTexture) return
    const writer = this.writer

    writer.pending.push(
      new Promise(async (resolve) => {
        const texture = (await createReadableTexture(_texture, { canvas: true, flipY: true })) as Texture
        textureDef.sampler = this.sampler
        const image: HTMLCanvasElement = texture.source.data

        const ktx2write = new KTX2Encoder()
        const imageDef: any = {
          width: image.width,
          height: image.height,
          mimeType: 'image/ktx2'
        }
        if (!writer.json.images) writer.json.images = []
        const imgIdx = writer.json.images.push(imageDef) - 1

        const imgData: ImageDataType = image.getContext('2d')!.getImageData(0, 0, image.width, image.height) as any
        ktx2write.encode(imgData).then(async (arrayBuffer) => {
          const bufferIdx = writer.processBuffer(arrayBuffer)

          const bufferViewDef = {
            buffer: bufferIdx,
            byteOffset: writer.byteOffset,
            byteLength: arrayBuffer.byteLength
          }

          writer.byteOffset += arrayBuffer.byteLength
          const bufferViewIdx = writer.json.bufferViews.push(bufferViewDef) - 1

          imageDef.bufferView = bufferViewIdx

          writer.extensionsUsed[this.name] = true
          textureDef.extensions = textureDef.extensions ?? {}
          textureDef.extensions[this.name] = { source: imgIdx }
          textureDef.sampler = this.sampler
          resolve(null)
        })
      })
    )
  }
}
