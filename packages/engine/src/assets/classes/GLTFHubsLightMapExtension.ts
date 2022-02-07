// https://github.com/mozilla/hubs/blob/27eb7f3d9eba3b938f1ca47ed5b161547b6fb3f2/src/components/gltf-model-plus.js

import { GLTFParser } from '../loaders/gltf/GLTFLoader'

export class GLTFHubsLightMapExtension {
  name = 'MOZ_lightmap'

  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }

  // @TODO: Ideally we should use extendMaterialParams hook.
  loadMaterial(materialIndex) {
    const parser = this.parser
    const json = parser.json
    const materialDef = json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return null
    }

    const extensionDef = materialDef.extensions[this.name]

    const pending: any[] = []

    pending.push(parser.loadMaterial(materialIndex))
    pending.push(parser.getDependency('texture', extensionDef.index))

    return Promise.all(pending).then((results) => {
      const material = results[0]
      const lightMap = results[1]
      material.lightMap = lightMap
      material.lightMapIntensity = extensionDef.intensity !== undefined ? extensionDef.intensity : 1
      return material
    })
  }
}
