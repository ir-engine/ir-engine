import { Material } from 'three'

import { materialIdToDefaultArgs, materialIdToFactory } from '../../../../renderer/materials/functions/Utilities'
import { MaterialLibrary } from '../../../../renderer/materials/MaterialLibrary'
import { GLTFLoaderPlugin, GLTFParser } from '../GLTFLoader'

export class EEMaterialImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_material'

  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }

  getMaterialType(materialIndex: number) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return null
    const eeMaterial = materialDef.extensions[this.name]
    const factory = materialIdToFactory(eeMaterial.uuid)
    return factory
      ? (function (args) {
          const material = factory(args)
          return material
        } as unknown as typeof Material)
      : null
  }

  extendMaterialParams(materialIndex: number, materialParams: { [_: string]: any }) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]
    if (!materialDef.extensions?.[this.name]) return Promise.resolve()
    const pending = []
    const extension = materialDef.extensions[this.name]
    const defaultArgs = materialIdToDefaultArgs(extension.type)!
    Object.entries(extension.args).map(async ([k, v]) => {
      materialParams[k] = v
    })
    return Promise.all(
      Object.entries(defaultArgs)
        .filter(([k, v]) => v.type === 'texture' && materialParams[k])
        .map(async ([k, v]) => parser.assignTexture(materialParams, k, materialParams[k]))
    )
  }
}
