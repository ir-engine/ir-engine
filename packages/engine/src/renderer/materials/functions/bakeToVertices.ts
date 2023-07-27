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

import { BufferAttribute, Color, Material, Mesh, Object3D, Texture } from 'three'

import createReadableTexture from '../../../assets/functions/createReadableTexture'
import { Engine } from '../../../ecs/classes/Engine'
import { changeMaterialPrototype } from './MaterialLibraryFunctions'

export default async function bakeToVertices<T extends Material>(
  material: T,
  colors: (keyof T)[],
  maps: { field: keyof T; attribName: string }[],
  root: Object3D | null = Engine.instance.scene,
  nuPrototype = 'MeshMatcapMaterial'
) {
  const pending = new Array<Promise<void>>()
  root?.traverse((mesh: Mesh) => {
    //for each vertex in each mesh with material assigned:
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    if (!materials.includes(material)) return //skip meshes without selected material
    const samples = Promise.all([
      ...maps
        .filter(({ field }) => (material[field] as Texture)?.isTexture)
        .map((map) => {
          const texture = material[map.field] as Texture
          const canvas = document.createElement('canvas')
          const uv = mesh.geometry.getAttribute(map.attribName) as BufferAttribute
          return new Promise<Color[]>((resolve) => {
            createReadableTexture(texture, { keepTransform: true, flipX: false, flipY: true }).then(
              (_texture: Texture) => {
                const image = _texture.image
                canvas.width = image.width
                canvas.height = image.height
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(image, 0, 0)
                const result = new Array<Color>()
                for (let i = 0; i < uv.count; i++) {
                  const sampleUv = [uv.getX(i), uv.getY(i)]
                  const x = sampleUv[0] * canvas.width
                  const y = (1 - sampleUv[1]) * canvas.height
                  const pixelData = Float32Array.from(ctx.getImageData(x, y, 1, 1).data).map((x) => x / 255)
                  const pixelColor = new Color(...pixelData)
                  result.push(pixelColor)
                }
                canvas.remove()
                ;(material as any)[map.field] = null
                resolve(result)
              }
            )
          })
        }),
      ...colors
        .filter((field) => (material[field] as Color)?.isColor)
        .map((field) => {
          const color = material[field] as Color
          const result = new Array<Color>(mesh.geometry.getAttribute('position').count)
          result.fill(color)
          ;(material as any)[field] = new Color('#fff')
          return Promise.resolve(result)
        })
    ]).then((samples) => {
      const composited = samples.reduce(
        (sample1, sample0) =>
          sample0.map((col, idx) => (sample1.length <= idx ? col.clone() : col.clone().multiply(sample1[idx]))),
        []
      )
      if (composited.length > 0)
        mesh.geometry.setAttribute(
          'color',
          new BufferAttribute(Float32Array.from(composited.flatMap((sample) => sample.toArray())), 3)
        )
    })
    pending.push(samples)
  })
  await Promise.all(pending)
  const nuMat = changeMaterialPrototype(material, nuPrototype)
  if (nuMat) {
    nuMat.vertexColors = true
    nuMat.defines = nuMat.defines ?? {}
    nuMat.defines!['USE_COLOR'] = ''
    nuMat.needsUpdate = true
  }
}
