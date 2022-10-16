import { Mesh, Object3D } from 'three'
import { GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader'

import { SourceType } from '../../../../renderer/materials/components/MaterialSource'
import { registerMaterial } from '../../../../renderer/materials/functions/Utilities'
import { MaterialLibrary } from '../../../../renderer/materials/MaterialLibrary'
import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export function registerMaterials(root: Object3D, type: SourceType = SourceType.EDITOR_SESSION, path: string = '') {
  root.traverse((mesh: Mesh) => {
    if (!mesh?.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials
      .filter((material) => !MaterialLibrary.materials.has(material.uuid))
      .map((material) => registerMaterial(material, { type, path }))
  })
}

export default class RegisterMaterialsExtension extends ImporterExtension implements GLTFLoaderPlugin {
  async afterRoot(result: GLTF) {
    const parser = this.parser
    registerMaterials(result.scene, SourceType.MODEL, parser.options.url)
  }
}
