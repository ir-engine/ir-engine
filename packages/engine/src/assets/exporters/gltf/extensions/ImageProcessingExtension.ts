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

import { CompressedTexture, Material, Mesh, Object3D, Texture } from 'three'

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

  beforeParse(input: Object3D | Object3D[]) {
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

  afterParse(input: Object3D | Object3D[]) {
    this.originalImages.forEach(({ material, field, texture }) => {
      URL.revokeObjectURL(material[field].image.src)
      material[field] = texture
    })
    this.originalImages = []
  }
}
