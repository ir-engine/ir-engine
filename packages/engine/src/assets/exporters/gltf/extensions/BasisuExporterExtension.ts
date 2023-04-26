import { ImageDataType } from '@loaders.gl/images'
import { CompressedTexture, Texture } from 'three'

import { dispatchAction } from '@etherealengine/hyperflux'
import { KTX2Encoder } from '@etherealengine/xrui/core/textures/KTX2Encoder'

import createReadableTexture from '../../../functions/createReadableTexture'
import { LSHIndex } from '../../../functions/lshIndex'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import BufferHandlerExtension from './BufferHandlerExtension'
import { ExporterExtension } from './ExporterExtension'

const hashCanvas = document.createElement('canvas')

export function getImageHash(image: HTMLImageElement | HTMLCanvasElement, size = 8) {
  hashCanvas.width = size
  hashCanvas.height = size
  const context = hashCanvas.getContext('2d')!
  context.drawImage(image, 0, 0, size, size)
  const imageData = context.getImageData(0, 0, size, size).data

  let sum = 0
  const grayscale: number[] = []
  for (let i = 0; i < imageData.length; i += 4) {
    const gray = 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]
    grayscale.push(gray)
    sum += gray
  }

  const avg = sum / (size * size)
  let hash = 0
  for (let i = 0; i < grayscale.length; i++) {
    if (grayscale[i] >= avg) {
      hash |= 1 << i
    }
  }

  return hash
}

export function stageHash(pHash: string | number, bits = 256): string {
  const binaryHash = (typeof pHash === 'number' ? pHash : parseInt(pHash, 16)).toString(2).padStart(bits, '0')
  return binaryHash
}

export default class BasisuExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'KHR_texture_basisu'
    this.sampler = writer.processSampler(new Texture())
    this.imageIdCache = {}
    this.lshIndex = new LSHIndex(20, 5)
  }

  imageIdCache: Record<string, string>
  lshIndex: LSHIndex
  sampler: number

  writeTexture(_texture: CompressedTexture, textureDef) {
    if (!_texture?.isCompressedTexture) return
    const writer = this.writer
    writer.pending.push(
      new Promise((resolve) => {
        createReadableTexture(_texture, { canvas: true, flipY: true }).then((texture: Texture) => {
          textureDef.sampler = this.sampler
          const image: HTMLCanvasElement = texture.source.data

          const imageDef: any = {
            width: image.width,
            height: image.height,
            mimeType: 'image/ktx2'
          }
          if (!writer.json.images) writer.json.images = []
          const imgIdx = writer.json.images.push(imageDef) - 1

          const imgData: ImageDataType = image.getContext('2d')!.getImageData(0, 0, image.width, image.height) as any
          const imgId = getImageHash(image)

          writer.extensionsUsed[this.name] = true
          textureDef.extensions = textureDef.extensions ?? {}
          textureDef.extensions[this.name] = { source: imgIdx }
          textureDef.sampler = this.sampler
          const stagedHash = stageHash(imgId)
          const similarImages = this.lshIndex.query(stagedHash, 5)
          const ktx2Encoder = new KTX2Encoder()
          similarImages.length && (imageDef.uri = this.imageIdCache[similarImages[0]])
          !similarImages.length &&
            ktx2Encoder.encode(imgData, false, 2, false, false).then(async (arrayBuffer) => {
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
                const relativeURI = `${writer.options.resourceURI ?? baseURI}/images/${imgId}.ktx2`
                const projectSpaceURI = `${baseURI}/${
                  writer.options.resourceURI ? `${writer.options.resourceURI}/` : ''
                }images`
                imageDef.uri = relativeURI
                this.imageIdCache[stagedHash] = relativeURI
                this.lshIndex.add(stagedHash, stagedHash)
                const saveParms = {
                  name: `${imgId}`,
                  byteLength: arrayBuffer.byteLength,
                  uri: `${projectSpaceURI}/${imgId}.ktx2`,
                  buffer: arrayBuffer
                }
                dispatchAction(
                  BufferHandlerExtension.saveBuffer({
                    saveParms,
                    projectName,
                    modelName: `${imgId}`
                  })
                )
              }
              ktx2Encoder.pool.dispose()
              resolve(null)
            })
        })
      })
    )
  }
}
