import { KTX2Encoder } from '@etherealjs/web-layer/core/textures/KTX2Encoder'
import {
  CompressedTexture,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  Uniform,
  WebGLRenderer
} from 'three'
import util from 'util'

import createReadableTexture from '../../../functions/createReadableTexture'
import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class BasisuExporterExtension extends ExporterExtension {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'KHR_texture_basisu'
    this.sampler = writer.processSampler(new Texture())
    this.imgCache = new Map<any, number>()
  }

  imgCache: Map<any, number>
  sampler: any

  writeTexture(_texture: CompressedTexture, textureDef) {
    if (!_texture.isCompressedTexture) return
    const writer = this.writer
    writer.pending.push(
      new Promise(async (resolve) => {
        const texture = (await createReadableTexture(_texture)) as Texture
        textureDef.source = writer.processImage(texture.image, texture.format, texture.flipY)
        textureDef.sampler = this.sampler
        resolve(null)
        /* const image: HTMLCanvasElement = texture.image

        const ktx2write = new KTX2Encoder()
        const imageDef: any = {
          width: image.width,
          height: image.height,
          mimeType: 'image/ktx2'
        }
        if (!writer.json.images) writer.json.images = []
        const index = writer.json.images.push(imageDef) - 1
        const blob = await new Promise<Blob | null>((resolve) => {
          if (typeof image.toBlob === 'function')
            image.toBlob(resolve)
          else {
            fetch(image.getAttribute('src')!).then(response => response.blob().then(resolve))
          }
        })

        if (blob) {
          const data = await blob.arrayBuffer()
          const imgData = {
            data: new Uint8Array(data),
            width: image.width,
            height: image.height,
            compressed: false
          }
          ktx2write.encode(imgData).then((arrayBuf) => {
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
        }
      })
    )*/
      })
    )
  }
}
