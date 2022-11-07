import { KTX2Encoder } from '@etherealjs/web-layer/core/textures/KTX2Encoder'
import {
  CompressedTexture,
  CubeTexture,
  Event,
  Material,
  Mesh,
  Object3D,
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
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class BasisuExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'KHR_texture_basisu'
    this.sampler = writer.processSampler(new Texture())
    this.replacedImages = new Map()
  }

  sampler: any
  replacedImages: Map<
    Texture,
    { replacement: Promise<Texture | null>; originals: { material: Material; field: string }[] }
  >

  addReplacement(material: Material, field: string, texture: Texture) {
    if (this.replacedImages.has(texture)) {
      const entry = this.replacedImages.get(texture)!
      entry.originals.push({ material, field })
      this.writer.pending.push(entry.replacement.then((replacement) => (material[field] = replacement)))
    } else {
      let texturePromise: Promise<Texture | null> = (async () => null)()
      const entry = { replacement: texturePromise, originals: new Array<{ material: Material; field: string }>() }
      entry.originals.push({ material, field })
      if (!(texture as CubeTexture).isCubeTexture) {
        texturePromise = new Promise<Texture>((resolve) => {
          createReadableTexture(texture, { flipY: true }).then((replacement: Texture) => {
            material[field] = replacement
            resolve(replacement)
          })
        })
      }
      this.replacedImages.set(texture, entry)
      this.writer.pending.push(texturePromise)
    }
  }

  beforeParse(input: Object3D | Object3D[]) {
    const materials = new Array()
    const subjects = Array.isArray(input) ? input : [input]
    for (const subject of subjects)
      subject.traverse((mesh: Mesh) => {
        if (mesh.isMesh) {
          if (Array.isArray(mesh.material)) materials.push(...mesh.material)
          else materials.push(mesh.material)
        }
      })
    materials.map((material) => {
      const textures = Object.entries(material).filter(
        ([k, val]) =>
          (val as CompressedTexture)?.isCompressedTexture ||
          (val as CubeTexture)?.isCubeTexture ||
          ((val as Texture)?.isTexture && !(val as Texture).image.src)
      )
      textures.map(([field, texture]: [string, CompressedTexture]) => this.addReplacement(material, field, texture))
    })
  }

  afterParse(input: Object3D<Event> | Object3D<Event>[]): void {
    ;[...this.replacedImages.entries()].map(([original, entry]) => {
      entry.originals.map(({ material, field }) => {
        material[field] = original
      })
    })
    this.replacedImages.clear()
  }

  writeTexture(_texture: CompressedTexture, textureDef) {
    if (!_texture.isCompressedTexture) return
    const writer = this.writer
    /*writer.pending.push(
      new Promise(async (resolve) => {
        const texture = (await createReadableTexture(_texture)) as Texture
        textureDef.source = writer.processImage(texture.image, texture.format, texture.flipY)
        textureDef.sampler = this.sampler
        resolve(null)*/
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
    /*})
    )*/
  }
}
