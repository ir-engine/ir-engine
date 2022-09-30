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
import { changeMaterialPrototype } from './Utilities'

export default async function bakeToVertices<T extends Material>(
  material: T,
  maps: { field: keyof T; attribName: string }[],
  root: Object3D = Engine.instance.currentWorld.scene
) {
  const pending = new Array<Promise<void>>()
  root.traverse((mesh: Mesh) => {
    //for each vertex in each mesh with material assigned:
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    if (!materials.includes(material)) return //skip meshes without selected material
    const samples = Promise.all(
      maps.map((map) => {
        const texture = material[map.field] as Texture
        if (!texture?.isTexture) return Promise.resolve()
        const canvas = document.createElement('canvas')
        const uv = mesh.geometry.getAttribute(map.attribName)
        return new Promise<Color[]>(async (resolve) => {
          const image = ((await createReadableTexture(texture)) as Texture).image as HTMLImageElement
          image.onload = () => {
            canvas.width = image.width
            canvas.height = image.height
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(image, 0, 0)
            const scaleNormalized: (vals: Vector2) => [number, number] = (vals) =>
              vals.toArray().map((val, i) => val * (i === 0 ? image.width : image.height)) as [number, number]
            ctx.translate(...scaleNormalized(texture.offset))
            ctx.scale(...texture.repeat.toArray()) //.map(val => 1 / val) as [number, number])
            const result = new Array()
            for (let i = 0; i < uv.count; i++) {
              const sampleUv = [uv.getX(i), uv.getY(i)]
              const x = sampleUv[0] * canvas.width
              const y = sampleUv[1] * canvas.height
              const ctx = canvas.getContext('2d')!
              const pixelData = Float32Array.from(ctx.getImageData(x, y, 1, 1).data).map((x) => Math.max(0.05, x / 255))
              const pixelColor = new Color(...pixelData)
              result.push(pixelColor)
            }
            canvas.remove()
            ;(material as any)[map.field] = null
            resolve(result)
          }
        })
      })
    )
      .then((samples) =>
        samples.reduce((sample0, sample1) =>
          sample0 === undefined
            ? sample1
            : sample1 === undefined
            ? sample0
            : sample0.map((col, idx) => col.multiply(sample1[idx]))
        )
      )
      .then((samples) => {
        mesh.geometry.setAttribute(
          'color',
          new BufferAttribute(Float32Array.from(samples!.flatMap((sample) => sample.toArray())), 3)
        )
      })
    pending.push(samples)
  })
  await Promise.all(pending)
  const nuMat = changeMaterialPrototype(material, 'MeshMatcapMaterial')
  if (nuMat) {
    nuMat.vertexColors = true
    nuMat.defines!['USE_COLOR'] = ''
    nuMat.needsUpdate = true
  }
}
