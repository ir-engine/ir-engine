import { CompressedTexture, Event, Material, Mesh, Object3D, Texture } from 'three'

import iterateObject3D from '../../../../scene/util/iterateObject3D'
import createReadableTexture from '../../../functions/createReadableTexture'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class ImageProcessingExtension extends ExporterExtension implements GLTFExporterPlugin {
  writer: GLTFWriter
  originalImages: {
    material: Material
    field: string
    texture: Texture
  }[]

  constructor(writer: GLTFWriter) {
    super(writer)
    this.writer = writer
    this.originalImages = []
  }

  beforeParse(input: Object3D<Event> | Object3D<Event>[]) {
    const writer = this.writer
    const inputs = Array.isArray(input) ? input : [input]
    inputs.forEach((input) =>
      iterateObject3D(input, (child: Mesh) => {
        if (child?.isMesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            Object.entries(material)
              .filter(([_, value]) => value instanceof Texture && !(value as CompressedTexture).isCompressedTexture)
              .forEach(([k, texture]) => {
                writer.pending.push(
                  createReadableTexture(texture, { flipY: true }).then((nuTexture) => {
                    this.originalImages.push({
                      material,
                      field: k,
                      texture
                    })
                    material[k] = nuTexture
                  })
                )
              })
          })
        }
      })
    )
  }

  afterParse(input: Object3D<Event> | Object3D<Event>[]) {
    this.originalImages.forEach(({ material, field, texture }) => {
      URL.revokeObjectURL(material[field].image.src)
      material[field] = texture
    })
    this.originalImages = []
  }
}
