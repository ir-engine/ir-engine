import { BufferGeometry, Mesh, PlaneGeometry, Scene } from 'three'

import { MaterialComponentType } from '../../renderer/materials/components/MaterialComponent'
import createGLTFExporter from './createGLTFExporter'

export default async function exportMaterialsGLTF(
  materials: MaterialComponentType[],
  options: {
    binary: boolean
    path: string
  }
): Promise<ArrayBuffer | { [key: string]: any } | undefined> {
  if (materials.length === 0) return
  const scene = new Scene()
  scene.name = 'Root'
  const dudGeo = new BufferGeometry()
  dudGeo.groups = materials.map((_, i) => ({ count: 0, start: 0, materialIndex: i }))
  const lib = new Mesh(
    dudGeo,
    [...materials.values()].map((entry) => entry.material)
  )
  lib.name = 'Materials'
  scene.add(lib)
  const exporter = await createGLTFExporter()
  const gltf = await new Promise<ArrayBuffer | { [key: string]: any }>((resolve) => {
    exporter.parse(
      scene,
      resolve,
      (e) => {
        throw e
      },
      {
        ...options,
        embedImages: options.binary,
        includeCustomExtensions: true
      }
    )
  })
  return gltf
}
