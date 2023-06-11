import { Mesh, Object3D } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { SourceType } from '../../../../renderer/materials/components/MaterialSource'
import { registerMaterial } from '../../../../renderer/materials/functions/MaterialLibraryFunctions'
import { initializeMaterialLibrary, MaterialLibraryState } from '../../../../renderer/materials/MaterialLibrary'
import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export function registerMaterials(root: Object3D, type: SourceType = SourceType.EDITOR_SESSION, path = '') {
  const materialLibrary = getState(MaterialLibraryState)
  root.traverse((mesh: Mesh) => {
    if (!mesh?.isMesh) return
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials
      .filter((material) => !materialLibrary.materials[material.uuid])
      .map((material) => {
        const materialComponent = registerMaterial(material, { type, path })
        material.userData?.plugins && materialComponent.plugins.set(material.userData['plugins'])
      })
  })
}

export default class RegisterMaterialsExtension extends ImporterExtension implements GLTFLoaderPlugin {
  async afterRoot(result: GLTF) {
    const parser = this.parser
    initializeMaterialLibrary()
    registerMaterials(result.scene, SourceType.MODEL, parser.options.url)
  }
}
