import { sample } from 'lodash'
import {
  BufferAttribute,
  BuiltinShaderAttributeName,
  Color,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture,
  Vector2
} from 'three'

import createReadableTexture from '../../../assets/functions/createReadableTexture'
import { Engine } from '../../../ecs/classes/Engine'
import { changeMaterialPrototype } from './MaterialLibraryFunctions'

export default async function bakeToVertices<T extends Material>(
  material: T,
  colors: (keyof T)[],
  maps: { field: keyof T; attribName: string }[],
  root: Object3D = Engine.instance.scene,
  nuPrototype: string = 'MeshMatcapMaterial'
) {
  const pending = new Array<Promise<void>>()
  root.traverse((mesh: Mesh) => {
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
          return new Promise<Color[]>(async (resolve) => {
            const image = (
              (await createReadableTexture(texture, { keepTransform: true, flipX: false, flipY: true })) as Texture
            ).image as HTMLImageElement
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
