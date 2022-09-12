import { Mesh } from 'three'

import { registerMaterial } from '../../../../renderer/materials/functions/Utilities'
import { MaterialLibrary } from '../../../../renderer/materials/MaterialLibrary'
import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'

export default class RegisterMaterialsExtension implements GLTFLoaderPlugin {
  async afterRoot(result: GLTF) {
    result.scene.traverse((mesh: Mesh) => {
      if (!mesh?.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials
        .filter((material) => !MaterialLibrary.materials.has(material.uuid))
        .map((material) => registerMaterial(material, this))
    })
  }
}
