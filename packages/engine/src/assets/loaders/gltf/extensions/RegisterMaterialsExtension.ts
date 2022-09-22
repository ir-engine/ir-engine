import { Mesh } from 'three'
import { GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader'

import { registerMaterial } from '../../../../renderer/materials/functions/Utilities'
import { MaterialLibrary } from '../../../../renderer/materials/MaterialLibrary'
import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export default class RegisterMaterialsExtension extends ImporterExtension implements GLTFLoaderPlugin {
  path: string

  constructor(parser: GLTFParser, path: string) {
    super(parser)
    this.path = path
  }

  async afterRoot(result: GLTF) {
    result.scene.traverse((mesh: Mesh) => {
      if (!mesh?.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials
        .filter((material) => !MaterialLibrary.materials.has(material.uuid))
        .map((material) => registerMaterial(material, { type: 'Model', path: this.path }))
    })
  }
}
