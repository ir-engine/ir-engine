import {
  BufferAttribute,
  Color,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Texture
} from 'three'

import createReadableTexture from '../../../assets/functions/createReadableTexture'
import { Engine } from '../../../ecs/classes/Engine'
import { changeMaterialPrototype } from './Utilities'

export default async function bakeToVertices(material: Material, root: Object3D = Engine.instance.currentWorld.scene) {
  const pending = new Array<Promise<void>>()
  root.traverse((mesh: Mesh) => {
    //for each vertex in each mesh with material assigned:
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    if (!materials.includes(material)) return //skip meshes without selected material
    const uv0 = mesh.geometry.getAttribute('uv')
    const uv1 = mesh.geometry.getAttribute('uv2')
    const diffuse = (material as MeshStandardMaterial | MeshBasicMaterial).map
    const lightMap = (material as MeshStandardMaterial | MeshBasicMaterial).lightMap
    const diffuseCanvas = document.createElement('canvas')
    const lightMapCanvas = document.createElement('canvas')
    const useDiffuse = diffuse && uv0
    const useLightMap = lightMap && uv1
    let diffusePromise = Promise.resolve()
    let lightMapPromise = Promise.resolve()
    if (useDiffuse) {
      diffusePromise = new Promise<void>(async (resolve) => {
        const diffuseImg = ((await createReadableTexture(diffuse)) as Texture).image as HTMLImageElement
        diffuseImg.onload = () => {
          diffuseCanvas.width = diffuseImg.width
          diffuseCanvas.height = diffuseImg.height
          const ctx = diffuseCanvas.getContext('2d')!
          ctx.drawImage(diffuseImg, 0, 0)
          resolve()
        }
      })
    }
    if (useLightMap) {
      lightMapPromise = new Promise<void>(async (resolve) => {
        const lightMapImg = ((await createReadableTexture(lightMap)) as Texture).image as HTMLImageElement
        lightMapImg.onload = () => {
          lightMapCanvas.width = lightMapImg.width
          lightMapCanvas.height = lightMapImg.height
          const ctx = lightMapCanvas.getContext('2d')!
          ctx.drawImage(lightMapImg, 0, 0)
          resolve()
        }
      })
    }
    pending.push(
      Promise.all([diffusePromise, lightMapPromise]).then(() => {
        const colorBuffer: number[] = []
        for (let i = 0; i < uv0.count; i++) {
          const compositeColor = new Color(1, 1, 1)
          //load lightmap and diffuse map into canvases and sample them at lightmap uvs
          if (useDiffuse) {
            const diffuseUv = [uv0.getX(i), uv0.getY(i)]
            const x = diffuseUv[0] * diffuseCanvas.width
            const y = diffuseUv[1] * diffuseCanvas.height
            const ctx = diffuseCanvas.getContext('2d')!
            const pixelData = Float32Array.from(ctx.getImageData(x, y, 1, 1).data).map((x) => x / 255)
            const pixelColor = new Color(...pixelData)
            compositeColor.multiply(pixelColor)
          }
          if (useLightMap) {
            const lightMapUv = [uv1.getX(i), uv1.getY(i)]
            const x = lightMapUv[0] * lightMapCanvas.width
            const y = lightMapUv[1] * lightMapCanvas.height
            const ctx = lightMapCanvas.getContext('2d')!
            const pixelData = Float32Array.from(ctx.getImageData(x, y, 1, 1).data).map((x) => Math.max(0.05, x / 255))
            const pixelColor = new Color(...pixelData)
            compositeColor.multiply(pixelColor)
          }
          //composite sampled diffuse, lightmap and save into BufferAttribute
          colorBuffer.push(...compositeColor.toArray())
        }
        //set mesh's color attribute to composites
        mesh.geometry.setAttribute('color', new BufferAttribute(Float32Array.from(colorBuffer), 3))
        diffuseCanvas.remove()
        lightMapCanvas.remove()
      })
    )
  })
  await Promise.all(pending)
  const nuMat = changeMaterialPrototype(material, 'MeshMatcapMaterial')
  if (nuMat) {
    nuMat.vertexColors = true
    if ((nuMat as MeshStandardMaterial).map) {
      ;(nuMat as MeshStandardMaterial).map = null
    }
    if ((nuMat as MeshStandardMaterial).lightMap) {
      ;(nuMat as MeshStandardMaterial).lightMap = null
    }
    nuMat.defines!['USE_COLOR'] = ''
    nuMat.needsUpdate = true
  }
}
