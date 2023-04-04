import { ImageDataType } from '@loaders.gl/images'
import { CompressedTexture, Texture } from 'three'
import { generateUUID } from 'three/src/math/MathUtils'

import { dispatchAction } from '@etherealengine/hyperflux'
import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

import createReadableTexture from '../../../functions/createReadableTexture'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import BufferHandlerExtension from './BufferHandlerExtension'
import { ExporterExtension } from './ExporterExtension'

export default class BasisuExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'KHR_texture_basisu'
    this.sampler = writer.processSampler(new Texture())
  }

  sampler: number

  writeTexture(_texture: CompressedTexture, textureDef) {
    if (!_texture?.isCompressedTexture) return
    const writer = this.writer

    writer.pending.push(
      new Promise((resolve) => {
        createReadableTexture(_texture, { canvas: true, flipY: true }).then((texture: Texture) => {
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
          ktx2write.encode(imgData, false, 32, false, true).then(async (arrayBuffer) => {
            if (writer.options.embedImages) {
              const bufferIdx = writer.processBuffer(arrayBuffer)

              const bufferViewDef = {
                buffer: bufferIdx,
                byteOffset: writer.byteOffset,
                byteLength: arrayBuffer.byteLength
              }
              writer.byteOffset += arrayBuffer.byteLength
              const bufferViewIdx = writer.json.bufferViews.push(bufferViewDef) - 1

              imageDef.bufferView = bufferViewIdx
            } else {
              const [_, projectName, baseURI] = /projects\/([^/]+)\/assets\/(.*)\/[^/]+$/.exec(writer.options.path!)!
              const imgId = generateUUID()
              const relativeURI = `${writer.options.resourceURI ?? baseURI}/images/${imgId}.ktx2`
              const projectSpaceURI = `${baseURI}/images`
              imageDef.uri = relativeURI
              writer.pending.push(
                new Promise((resolve) => {
                  const saveParms = {
                    name: imgId,
                    byteLength: arrayBuffer.byteLength,
                    uri: `${projectSpaceURI}/${imgId}.ktx2`,
                    buffer: arrayBuffer
                  }
                  dispatchAction(
                    BufferHandlerExtension.saveBuffer({
                      saveParms,
                      projectName,
                      modelName: imgId
                    })
                  )
                  resolve(null)
                })
              )
            }
            writer.extensionsUsed[this.name] = true
            textureDef.extensions = textureDef.extensions ?? {}
            textureDef.extensions[this.name] = { source: imgIdx }
            textureDef.sampler = this.sampler
            resolve(null)
          })
        })
      })
    )
  }
}
